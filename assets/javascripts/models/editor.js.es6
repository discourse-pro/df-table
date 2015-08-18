/**
 * @external {Chunks}
 * @external Ember.Object
 */
export default Ember.Object.extend({
	init() {
		this._super();
		$.dfMagnificPopup.open({
			items: {
				src: $('<div/>').addClass('df-table-popup').html(this.tableHtml())
				,type: 'inline'
			}
			,callbacks: {
				change(data) {
					debugger;
					//const imageId = data.el.children('img').attr('data-file-id');
				}
				,close() {debugger;}
	  		}
		});
		//console.log(this.tableHtml());
		/*$('body').append('<div class="emoji-modal-wrapper"></div>');
		$('.emoji-modal-wrapper').click(function() {
			$('.emoji-modal, .emoji-modal-wrapper').remove();
		});*/
	},
	/**
	 * 2015-08-18
	 * Алгоритм не работает, если курсор расположен внутри открывающего или закрывающего тега table,
	 * но нас это устаивает
	 * @return {String}
	 */
	tableHtml() {
		if (!this.get('_tableHtml')) {
			/** @type {Chunks} */
			const chunk = this.get('chunk');
			/** @type {String} */
			const start = chunk.before.substring(chunk.before.lastIndexOf('<table'));
			/** @type {String} */
			const end = chunk.after.substring(0, chunk.after.indexOf('</table>')) + '</table>';
			this.set('_tableHtml', start + end);
		}
		return this.get('_tableHtml');
	}
});