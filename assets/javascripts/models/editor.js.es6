/**
 * @external {Chunks}
 * @external Ember.Object
 */
const Editor = Ember.Object.extend({
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
	create(chunk, fixupInputArea) {
		this._super({chunk: chunk});
		debugger;
		console.log(this.tableHtml());
		return false;
	},
	/**
	 * 2015-08-18
	 * Алгоритм не работает, если курсор расположен внутри открывающего или закрывающего тега table,
	 * но нас это устаивает
	 * @return {String}
	 */
	tableHtml() {
		if (!this.get('tableHtml')) {
			/** @type {Chunks} */
			const chunk = this.get('chunk');
			/** @type {String} */
			const start = chunk.before.substring(chunk.before.lastIndexOf('<table'));
			/** @type {String} */
			const end = chunk.after.substring(0, chunk.after.indexOf('</table>')) + '</table>';
			this.set('tableHtml', start + end);
		}
		return this.get('tableHtml');
	}
});
Editor.reopenClass({
	init() {
		PagedownCustom.appendButtons.push({
			id: 'wmd-df-table'
			,description: I18n.t('composer.df.table')
			,execute: function(chunk, fixupInputArea) {
				Editor.create(chunk, fixupInputArea);
			}
		});
	}
});
export default Editor;