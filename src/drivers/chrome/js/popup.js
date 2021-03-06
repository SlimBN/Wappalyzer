document.addEventListener('DOMContentLoaded', function() {
	var
		slugify, popup,
		d            = document,
		detectedApps = d.getElementById('detected-apps');

	slugify = function(string) {
		return string.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-').replace(/(?:^-|-$)/, '');
	};

	popup = {
		init: function() {
			d.getElementById('options').addEventListener('click', function() {
				window.open(chrome.extension.getURL('options.html'));
			});

			chrome.tabs.getSelected(null, function(tab) {
				if ( tab.url.match(/https?:\/\//) ) {
					detectedApps.innerHTML = '<div class="empty">' + chrome.i18n.getMessage('noAppsDetected') + '</div>';
				} else {
					detectedApps.innerHTML = '<div class="empty">' + chrome.i18n.getMessage('nothingToDo') + '</div>';
				}
			});

			popup.displayApps();
		},

		displayApps: function() {
			var appName, confidence, version;

			chrome.tabs.getSelected(null, function(tab) {
				chrome.extension.sendRequest({ id: 'get_apps', tab: tab }, function(response) {
					if ( response.tabCache && response.tabCache.count > 0 ) {
						detectedApps.innerHTML = '';

						for ( appName in response.tabCache.appsDetected ) {
							confidence = response.tabCache.appsDetected[appName].confidenceTotal;
							version    = response.tabCache.appsDetected[appName].version;

							html =
								'<div class="detected-app">' +
									'<a target="_blank" href="https://wappalyzer.com/applications/' + slugify(appName) + '?pk_campaign=chrome&pk_kwd=popup">' +
										'<img src="images/icons/' + response.apps[appName].icon + '"/>' +
										'<span class="label"><span class="name">' + appName + '</span>' + ( version ? ' ' + version : '' ) + ( confidence < 100 ? ' (' + confidence + '% sure)' : '' ) + '</span>' +
									'</a>';

							response.apps[appName].cats.forEach(function(cat) {
								html +=
									'<a target="_blank" href="https://wappalyzer.com/categories/' + slugify(response.categories[cat]) + '?pk_campaign=chrome&pk_kwd=popup">' +
										'<span class="category"><span class="name">' + chrome.i18n.getMessage('categoryName' + cat) + '</span></span>' +
									'</a>';
							});

							html +=
									'</a>' +
								'</div>';

							detectedApps.innerHTML = detectedApps.innerHTML + html;
						}
					}
				});
			});
		}
	};

	popup.init();
});
