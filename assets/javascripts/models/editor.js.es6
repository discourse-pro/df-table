import df from 'discourse/plugins/df-core/df';
import loadScript from 'discourse/lib/load-script';
/**
 * @external {Chunks}
 * @external Ember.Object
 */
export default Ember.Object.extend({
	init() {
		this._super();
		//this.tableHtml()
		df.loadCss('/plugins/df-table/handsontable.full.css');
		var _this = this;
		loadScript('/plugins/df-table/handsontable.full.js').then(function() {
			$.dfMagnificPopup.open({
				callbacks: {
					/** @param {Object} data */
					change(data) {_this.render(data.inlineElement);}
					,close() {_this.onClose();}
		  		}
				,items: {
					src: $('<div/>').addClass('df-table-popup')
					,type: 'inline'
				}
				,showCloseBtn: false
			});
		});
	},
	/**
	 * @param {jQuery} $c HTMLDivElement
	 */
	render($c) {
		const $h = $('<div/>').addClass('df-handsontable');
		$c.append($h);
		const data = this.initialTableData();
		this.set('handsontable', new Handsontable($h.get(0), {
			data: data,
			height: Math.min(data.length * 22 + 100, Math.round(0.75 * $(window).height())),
			colHeaders: true,
			rowHeaders: true,
			stretchH: 'all',
			columnSorting: true,
			contextMenu: true
		}));
	},
	onClose() {
		/** @type {Handsontable} */
		const handsontable = this.get('handsontable');
		/** @type {String[][]} */
		const data = handsontable.getData();
		/** @type {jQuery} HTMLTableElement */
		const $result = this.$initialTable().clone();
		/** @type {jQuery} HTMLTableSectionElement */
		const $tbody = $('tbody', $result);
		/** @type {jQuery} HTMLTableSectionElement */
		const $thead = $('thead', $result);
		/** @type {Boolean} */
		const hasHead = !!$thead.children('tr').length;
		$thead.empty();
		$tbody.empty();
		/*
		 * @param {jQuery} $container HTMLTableSectionElement
		 * @param {String[]} rowData
		 * @param {String} cellTag
		 */
		const createRow = function($container, rowData, cellTag) {
			/** @type {jQuery} HTMLTableRowElement */
			const $row = $('<tr>');
			$container.append($row);
			$.each(rowData, function() {
				$row.append($(cellTag).append(this));
			});
		};
		if (data.length) {
			if (hasHead) {
				/** @type {String[]} */
				const headData = data.shift();
				createRow($thead, headData, '<th>');
			}
			$.each(data, function() {
				createRow($tbody, this, '<td>');
			});
		}
		var _this = this;
		// https://github.com/zachofalltrades/jquery.format
		loadScript('/plugins/df-table/dfPrettify.js').then(function() {
			_this.updateMarkdown($.dfPrettify(df.dom.outerHtml($result), {step: "\t"}));
		});
	},
	/**
	 * @param {String} newContent
	 */
	updateMarkdown(newContent) {
		/**
		 * https://github.com/discourse/discourse/blob/v1.4.0.beta9/app/assets/javascripts/discourse/controllers/composer.js.es6#L4
		 */
		const composerController = Discourse.__container__.lookup('controller:composer');
		/**
		 * https://github.com/discourse/discourse/blob/v1.4.0.beta9/app/assets/javascripts/discourse/models/composer.js.es6#L35
		 * @type {Composer}
		 */
		const composerModel = composerController.get('model');
		/** @type {String} */
		var allContent = composerModel.get('reply');
		composerModel.set('reply', allContent.replace(this.initialContent(), newContent));
	},
	/** @return {String[][]} */
	initialTableData() {
		var result = [];
		$('tr', this.$initialTable()).each(function() {
			/** @type {String[]} */
			var rowData = [];
			$('th,td', $(this)).each(function() {
				rowData.push($(this).html());
			});
			result.push(rowData);
		});
		return result;
	},
	/**
	 * 2015-08-18
	 * Алгоритм не работает, если курсор расположен внутри открывающего или закрывающего тега table,
	 * но нас это устаивает
	 * @return {String}
	 */
	initialContent() {
		if (!this.get('_initialContent')) {
			/** @type {Chunks} */
			const chunk = this.get('chunk');
			/** @type {String} */
			const start = chunk.before.substring(chunk.before.lastIndexOf('<table'));
			/** @type {String} */
			const end = chunk.after.substring(0, chunk.after.indexOf('</table>')) + '</table>';
			this.set('_initialContent', start + end);
		}
		return this.get('_initialContent');
	},
	/**
	 * 2015-08-18
	 * Алгоритм не работает, если курсор расположен внутри открывающего или закрывающего тега table,
	 * но нас это устаивает
	 * @return {jQuery} HTMLTableElement
	 */
	$initialTable() {
		if (!this.get('_$initialTable')) {
			this.set('_$initialTable', $(this.initialContent()));
		}
		return this.get('_$initialTable');
	}
});