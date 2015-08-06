import {decorateCooked} from 'discourse/lib/plugin-api';
export default {name: 'df-table', after: 'inject-objects', initialize: function(c) {
	decorateCooked(c, onDecorateCooked);
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
 * @param {jQuery} HTMLDivElement $post
 * @returns void
 */
const onDecorateCooked = function($post) {
	/** @type {jQuery} HTMLTableElement[] */
	const $tables = $('.cooked > table', $post);
	$('td', $tables).each(function() {
		/** @type {jQuery} HTMLTableCellElement */
		const $td = $(this);
		/** @type {String} */
		const text = $td.html().trim();
		if (/^[+-]?[\d]+(?:[.,]?[\d]+)?$/.test(text)) {
			$td.addClass('number');
		}
		if (/^\$[\d]+(?:[.,]?[\d]+)?$/.test(text)) {
			$td.addClass('money');
		}
	});
};