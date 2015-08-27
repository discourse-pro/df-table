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
	 * @used-by init()
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
		if (this.isNewTable()) {
			// https://github.com/discourse/discourse/blob/v1.4.0.beta9/app/assets/javascripts/discourse/models/composer.js.es6#L293
			composerModel.appendText(newContent, this.chunk().before.length, {block: true})
		}
		else {
			/** @type {String} */
			var allContent = composerModel.get('reply');
			composerModel.set('reply', allContent.replace(this.initialContent(), newContent));
		}
	},
	/**
	 * @private
	 * @used-by render()
	 * @return {String[][]}
	 */
	initialTableData() {
		/** @type {String[][]} */
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
	 * но нас это устраивает
	 * @private
	 * @return {String}
	 */
	initialContent() {
		if (df.u(this.get('_initialContent'))) {
			this.set('_initialContent',
				this.isNewTable()
				// 2015-08-27
				// Создаём новую таблицу по заданному администратором шаблону.
				// https://meta.discourse.org/t/31183/20
				? Discourse.SiteSettings['«Table»_Template']
				: this.chunk().before.substring(this.nearestStartTagIndexBefore())
				 + this.chunk().after.substring(0, this.chunk().after.indexOf('</table>')) + '</table>'
			);
		}
		return this.get('_initialContent');
	},
	/**
	 * 2015-08-18
	 * Алгоритм не работает, если курсор расположен внутри открывающего или закрывающего тега table,
	 * но нас это устаивает
	 * @private
	 * @return {jQuery} HTMLTableElement
	 */
	$initialTable() {
		if (df.u(this.get('_$initialTable'))) {
			this.set('_$initialTable', $(this.initialContent()));
		}
		return this.get('_$initialTable');
	},
	/**
	 * 2015-08-27
	 * Нам нужно определить, находится ли курсор внутри таблицы.
	 * Если курсор не находится внутри таблицы, то это значит,
	 * что надо создать новую таблицу.
	 * https://meta.discourse.org/t/31183/20
	 * @private
	 * @return {Boolean}
	 */
	isNewTable() {
		if (df.u(this.get('_isNewTable'))) {
			this.set('_isNewTable',
				 this.nearestStartTagIndexBefore() <= this.nearestEndTagIndexBefore()
			);
		}
		return this.get('_isNewTable');
	},
	/**
	 * 2015-08-27
	 * @private
	 * @return {Number}
	 */
	nearestEndTagIndexBefore() {
		if (df.u(this.get('_nearestEndTagIndexBefore'))) {
			this.set('_nearestEndTagIndexBefore', this.chunk().before.lastIndexOf('</table>'));
		}
		return this.get('_nearestEndTagIndexBefore');
	},
	/**
	 * 2015-08-27
	 * @private
	 * @return {Number}
	 */
	nearestStartTagIndexBefore() {
		if (df.u(this.get('_nearestStartTagIndexBefore'))) {
			this.set('_nearestStartTagIndexBefore', this.chunk().before.lastIndexOf('<table'));
		}
		return this.get('_nearestStartTagIndexBefore');
	},
	/**
	 * 2015-08-27
	 * @private
	 * @return {Chunks}
	 */
	chunk() {return this.get('_chunk');}
});