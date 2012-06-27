/**
 *
 */
(function ($)
{
    $.widget('zbz.selectlist', {
        options: {
            boxClass: 'zbz-selectlist',
            itemClass: 'zbz-selectlist-item',
            multipleClass: 'zbz-selectlist-multiple',
            click: null,
            create: null,
            refresh: null
        },

        _create: function ()
        {
        },

        widget: function ()
        {
            return this.box;
        },

        refresh: function ()
        {
            this._refresh();
        },

        refreshItems: function ()
        {
            this._refreshItems();
        },

        _refresh: function ()
        {
            this.multiple = this.element.is('[multiple]');

            this._readItems();
            this._renderItems();
            this._refreshItems();

            if (this.multiple) {
                this.box.addClass(this.options.multipleClass);
            }
            else {
                this.box.removeClass(this.options.multipleClass);
            }

            if (this.element.attr('disabled')) {
                this.disable();
            }
            else {
                this.enable()
            }

            this._trigger('refresh');
        },

        _refreshItems: function ()
        {
            var self = this;

            $.each(this.items, function (index, item)
            {
                self._refreshItem(item);
            });
        },

        _refreshItem: function (item)
        {
            if (item.option.selected && this.hasScroll()) {
                var box_height = this.box.height();
                var box_offset = this.box.offset().top;
                var box_scroll = this.box.scrollTop();
                var opt_height = item.element.height();
                var opt_offset = item.element.offset().top - box_offset + box_scroll;
                var new_offset = opt_offset - (box_height - opt_height) / 2;

                this.box.scrollTop(new_offset);
            }

            if (item.option.selected) {
                item.element.addClass('ui-state-selected');
            } else {
                item.element.removeClass('ui-state-selected');
            }

            if (item.option.disabled) {
                item.element.addClass('ui-state-disabled');
            } else {
                item.element.removeClass('ui-state-disabled');
            }
        },

        _readItems: function ()
        {
            var self = this;
            var items = [];

            $.each(this.element.find('option'), function (index, option)
            {
                items.push({
                    index: index,
                    option: option
                });
            });

            this.items = items;
        },

        _element_change: function (event)
        {
            this._refreshItems();
        },

        _item_click: function (event)
        {
            var item = $(event.target).data('item.selectlist');
            this._process_click(event, item, this.multiple);
        },

        _process_click: function (event, item, multiple)
        {
            if (!item.option.disabled) {
                var doclick = this._trigger('click', event, {
                    item: item
                });

                if (doclick) {
                    if (multiple) {
                        if (item.option.selected) {
                            this._removeSelectedIndex(item.index);
                        } else {
                            this._addSelectedIndex(item.index);
                        }
                    } else {
                        this._setSelectedIndex(item.index);
                    }
                }
            }
        },

        _getSelectedIndex: function ()
        {
            return this.element[0].selectedIndex;
        },

        _getSelectedIndexes: function ()
        {
            var indexes = [];

            $.each(this.element[0].options, function (index, option)
            {
                if (option.selected) {
                    indexes.push(index);
                }
            });

            return indexes;
        },

        _setSelectedIndex: function (index)
        {
            this._setSelectedIndexes([index]);
        },

        _addSelectedIndex: function (index)
        {
            if (this.items[index]) {
                var changed = !this.items[index].option.selected;
                this.items[index].option.selected = true;
                if (changed) {
                    this.element.trigger('change');
                }
            }
        },

        _setSelectedIndexes: function (indexes)
        {
            var changed = false;
            var self = this;

            $.each(this.items, function (index, item)
            {
                var oldval = item.option.selected;
                var newval = $.inArray(index, indexes) >= 0;
                if (oldval != newval) {
                    if (newval) {
                        item.option.selected = true;
                    } else {
                        item.option.selected = false;
                    }
                    changed = true;
                }
            });

            if (changed) {
                this.element.trigger('change');
            }
        },

        _removeSelectedIndex: function (index)
        {
            if (this.items[index]) {
                var changed = this.items[index].option.selected;
                this.items[index].option.selected = false;
                if (changed) {
                    this.element.trigger('change');
                }
            }
        },

        hasScroll: function ()
        {
            return this.box.height() < this.box[ $.fn.prop ? 'prop' : 'attr' ]('scrollHeight');
        }
    });

    /**
     * ListBox
     *
     * @author zema
     */
    $.widget('zbz.listbox', $.zbz.selectlist,
        {
            // widgetEventPrefix: 'listbox',
            // widgetBaseClass: 'listbox',

            options: {
                boxClass: 'zbz-listbox',
                itemClass: 'zbz-listbox-item',
                multipleClass: 'zbz-listbox-multiple'
            },

            _create: function ()
            {
                var opt = this.options;

                this.element.bind('change.listbox', $.proxy(this._element_change, this)).hide();
                this.box = $('<span />').addClass(opt.boxClass + ' ui-widget-content ui-corner-all').insertAfter(this.element);
                this.box.delegate('.' + opt.itemClass, 'click', $.proxy(this._item_click, this));

                this.refresh();

                this._trigger('create');
            },

            _renderItems: function ()
            {
                var self = this;

                this.box.empty();

                $.each(this.items, function (index, item)
                {
                    self._renderItem(item);
                });
            },

            _renderItem: function (item)
            {
                var opt = this.options;

                item.element = $('<div />').data('item.listbox', item);
                item.element.addClass(opt.itemClass + ' ui-corner-all');
                item.element.attr('title', item.option.text);
                item.element.text(item.option.text);
                item.element.appendTo(this.box);
            },

            _item_click: function (event)
            {
                var item = $(event.target).data('item.listbox');
                this._process_click(event, item, event.ctrlKey && this.multiple);
            }
        });

    /**
     * SelectBox
     *
     * @author zema
     */
    $.widget('zbz.selectbox', $.zbz.selectlist,
        {
            // widgetEventPrefix: 'selectbox',
            // widgetBaseClass: 'selectbox',

            options: {
                boxClass: 'zbz-selectbox',
                itemClass: 'zbz-selectbox-item',
                multipleClass: 'zbz-selectbox-multiple'
            },

            _create: function ()
            {
                var opt = this.options;

                this.element.bind('change.selectbox', $.proxy(this._element_change, this)).hide();
                this.box = $('<span />').addClass(opt.boxClass).addClass('ui-widget-content ui-corner-all').insertAfter(this.element);
                this.box.delegate('.' + opt.itemClass, 'click', $.proxy(this._item_click, this));

                this.refresh();

                this._trigger('create');
            },

            _renderItems: function ()
            {
                var self = this;

                this.box.empty();

                $.each(this.items, function (index, item)
                {
                    self._renderItem(item);
                });
            },

            _renderItem: function (item)
            {
                var opt = this.options;

                item.element = $('<div />').data('item.selectbox', item);
                item.element.addClass(opt.itemClass);
                item.element.attr('title', item.option.text);
                item.element.text(item.option.text);
                item.element.appendTo(this.box);
            },

            _item_click: function (event)
            {
                var item = $(event.target).data('item.selectbox');
                this._process_click(event, item, this.multiple);
            }
        });

}(jQuery));
