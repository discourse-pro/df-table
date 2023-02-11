import {withPluginApi} from 'discourse/lib/plugin-api';
export default {name: 'df-table', initialize() {
	if (Discourse.SiteSettings['«Table»_Enabled']) {
		withPluginApi('0.1', api => {api.decorateCooked(onDecorateCooked);});
	}
}};
/**
 * 2015-08-06
 * 1) decorateCooked вызывает своих подписчиков для каждого сообщения отдельно.
 * 2) $post содержит не только сообщение, но и элементы управления.
 * Чтобы применить свои селекторы только к сообщению,
 * используйте родительский селектор .cooked, например:
 * const $tables = $('.cooked > table', $post);
 * @used-by decorateCooked
 * @link https://github.com/discourse/discourse/blob/v1.4.0.beta7/app/assets/javascripts/discourse/lib/plugin-api.js.es6#L5
 * @param {jQuery} $post HTMLDivElement
 * @returns void
 */
const onDecorateCooked = function($post) {
	const $tables = $('.cooked > table', $post); /** @type {jQuery} HTMLTableElement[] */
	$tables.each(function() {
		const $table = $(this);
		const hasHeader = !!$('th', $table).length;
		$('tr', $table).each(function(rowIndex) {
			$('td', $(this)).each(function() {
				const $td = $(this); /** @type {jQuery} HTMLTableCellElement */
				var text = $td.html().trim(); /** @type {String} */
				if ('#' === text) {
					text = hasHeader ? rowIndex : rowIndex + 1;
				}
				$td.html(text);
				if (/^[+-]?[\d]+(?:[.,]?[\d]+)?$/.test(text)) {
					$td.addClass('number');
				}
				if (/^\$[\d]+(?:[.,]?[\d]+)?$/.test(text)) {
					$td.addClass('money');
				}
			});
		});
	});
};