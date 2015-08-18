import {decorateCooked} from 'discourse/lib/plugin-api';
import TableEditor from 'discourse/plugins/df-table/models/editor';
export default {name: 'df-table', initialize(c) {if (Discourse.SiteSettings['«Table»_Enabled']) {
	decorateCooked(c, onDecorateCooked);
	PagedownCustom.appendButtons.push({
		id: 'wmd-df-table'
		,description: I18n.t('composer.df.table')
		/**
		 * 2015-08-18
		 * @used-by https://github.com/discourse/discourse/blob/v1.4.0.beta9/app/assets/javascripts/discourse/lib/Markdown.Editor.js#L1348
			var noCleanup = button.textOp(chunks, fixupInputArea);
			if (!noCleanup) {
				fixupInputArea();
			}
		 *
		 * @param {Chunks} chunk
		 * https://github.com/discourse/discourse/blob/v1.4.0.beta9/app/assets/javascripts/discourse/lib/Markdown.Editor.js#L777-L788
		 * https://github.com/discourse/discourse/blob/v1.4.0.beta9/app/assets/javascripts/discourse/lib/Markdown.Editor.js#L178
		 *
			this.getChunks = function () {
				var chunk = new Chunks();
				chunk.before = util.fixEolChars(stateObj.text.substring(0, stateObj.start));
				chunk.startTag = "";
				chunk.selection = util.fixEolChars(stateObj.text.substring(stateObj.start, stateObj.end));
				chunk.endTag = "";
				chunk.after = util.fixEolChars(stateObj.text.substring(stateObj.end));
				chunk.scrollTop = stateObj.scrollTop;
			return chunk;
			};
		 *
		 * chunk.before содержит текст перед курсором
		 * chunk.after содержит текст после курсора
		 *
		 * @param {Function} fixupInputArea
		 * https://github.com/discourse/discourse/blob/v1.4.0.beta9/app/assets/javascripts/discourse/lib/Markdown.Editor.js#L1336-L1346
		 *
		 * @returns {Boolean}
		 * Emoji всегда возвращает false либо undefined.
		 * https://github.com/discourse/discourse/blob/v1.4.0.beta9/app/assets/javascripts/discourse/lib/emoji/emoji-toolbar.js.es6#L228-L245
		 */
		,execute: function(chunk, fixupInputArea) {TableEditor.create({chunk: chunk});}
	});
}}};
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