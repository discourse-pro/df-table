(function() {
	var tableTagsAdjusted = false;
	Discourse.Dialect.on('parseNode', function(event) {
		if (!tableTagsAdjusted) {
			var html4 = window && window.html4 ? window.html4 : null;
			if (html4 && html4.eflags && html4.ELEMENTS) {
				var removeUnsafeFlag = function() {
					var i;
					for (i = 0; i < arguments.length; i++) {
						var tag = arguments[i];
						html4.ELEMENTS[tag] = html4.ELEMENTS[tag] &~ html4.eflags.UNSAFE;
					}
				};
				removeUnsafeFlag('table', 'tbody', 'thead', 'tfoot', 'caption', 'tr', 'th', 'td');
				tableTagsAdjusted = true;
			}
		}
	});
	/**
	  If a row begins with HTML tags, don't parse it.
	**/
	var blockTags = ['address', 'article', 'aside', 'audio', 'blockquote', 'canvas', 'dd', 'div',
	                 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3',
	                 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'iframe', 'noscript', 'ol', 'output',
	                 'p', 'pre', 'section', 'ul', 'video'],

	    splitAtLast = function(tag, block, next, first) {
	      var endTag = "</" + tag + ">",
	          endTagIndex = first ? block.indexOf(endTag) : block.lastIndexOf(endTag);

	      if (endTagIndex !== -1) {
	        endTagIndex += endTag.length;

	        var leading = block.substr(0, endTagIndex),
	            trailing = block.substr(endTagIndex).replace(/^\s+/, '');

	        if (trailing.length) {
	          next.unshift(trailing);
	        }

	        return [ leading ];
	      }
	    };

	var breakRegex = /\r?\n|\r/g;
	var preservedBreak = '##BREAK##';
	var replacer = function(match, tagBegin, contents, tagEnd, offset, string) {
		return tagBegin + contents.replace(breakRegex, preservedBreak) + tagEnd;
	};
	var removeLineBreaksOutsideCells = function(table) {
		/**
		 * @link http://stackoverflow.com/a/3395858
		 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter
		 */
		table = table.replace(/(<td(?: [^>]*)?>)([\s\S]*?)(<\/td>)/gmi, replacer);
		table = table.replace(/(<th(?: [^>]*)?>)([\s\S]*?)(<\/th>)/gmi, replacer);
		table = table.replace(breakRegex, ' ');
		/** @link http://stackoverflow.com/a/1144788 */
		table = table.replace(new RegExp(preservedBreak, 'g'), "\n");
		return table;
	};
	Discourse.Dialect.registerBlock('html', function(block, next) {
		var split, pos;

	  // Fix manual blockquote paragraphing even though it's not strictly correct
	  // PERF NOTE: /\S+<blockquote/ is a perf hog for search, try on huge string
	  if (pos = block.search(/<blockquote/) >= 0) {
	    if(block.substring(0, pos).search(/\s/) === -1) {
	      split = splitAtLast('blockquote', block, next, true);
	      if (split) { return this.processInline(split[0]); }
	    }
	  }

	  var m = /^<([^>]+)\>/.exec(block);
	  if (m && m[1]) {
	    var tag = m[1].split(/\s/);
		if (tag && tag[0]) {
			if ('table' === tag[0]) {
				var dfContents = block.toString();
				dfContents = removeLineBreaksOutsideCells(dfContents);
				return [ ["para"].concat( this.processInline( dfContents ) ) ];
			}
		}
	    if (tag && tag[0] && blockTags.indexOf(tag[0]) !== -1) {
	      split = splitAtLast(tag[0], block, next);
	      if (split) {
	        if (split.length === 1 && split[0] === block) { return; }
	        return split;
	      }
	      return [ block.toString() ];
	    }
	  }
	});
	var globalAttributes = ['id', 'class', 'data-*', 'style'];
	var whiteListAttributes = function(tag, attributes) {
		var i;
		attributes = attributes.concat(globalAttributes);
		for (i = 0; i < attributes.length; i++) {
			Discourse.Markdown.whiteListTag(tag, attributes[i]);
		}
	};
	whiteListAttributes('table', ['align', 'bgcolor', 'border', 'cellpadding', 'cellspacing', 'sortable', 'width']);
	whiteListAttributes('tbody', ['align', 'valign']);
	whiteListAttributes('thead', ['align', 'valign']);
	whiteListAttributes('tfoot', ['align', 'valign']);
	whiteListAttributes('tr', ['align', 'valign', 'bgcolor']);
	whiteListAttributes('td', ['align', 'bgcolor', 'colspan', 'headers', 'height', 'nowrap', 'rowspan', 'scope', 'valign', 'width']);
	whiteListAttributes('th', ['align', 'bgcolor', 'colspan', 'headers', 'height', 'nowrap', 'rowspan', 'scope', 'valign', 'width']);
	whiteListAttributes('caption', ['align']);
})();
