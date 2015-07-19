import { decorateCooked } from 'discourse/lib/plugin-api';
export default {name: 'df-table', after: 'inject-objects', initialize: function (container) {
	decorateCooked(container, function($post) {
		var $tables = $('.cooked').children('table');
		$('td', $tables).each(function() {
			var $td = $(this);
			var text = $td.html().trim();
			if (/^[+-]?[\d]+(?:[.,]?[\d]+)?$/.test(text)) {
				$td.addClass('number');
			}
			if (/^\$[\d]+(?:[.,]?[\d]+)?$/.test(text)) {
				$td.addClass('money');
			}
		});
	});
}};