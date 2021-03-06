/**
 * @author xuld
 */

imports("Controls.Form.ListBox");
using("System.Dom.KeyNav");
using("Controls.Core.ListControl");

/**
 * 表示一个下拉菜单。用于 Suggest 和 ComboBox 组件。
 * @extends ListControl
 */
var DropDownMenu = ListControl.extend({

    xtype: "listbox",

    /**
	 * 处理上下按键。
     * @private
	 */
    _handlerUpDown: function (next) {

        // 如果菜单未显示。
        if (this.isDropDownHidden()) {

            // 显示菜单。
            this.showDropDown();
        } else {

            var item = this.dropDown._hovering;

            if (item) {
                item = item[next ? 'next' : 'prev']();
            }

            if (!item) {
                item = this.dropDown[next ? 'first' : 'last']();
            }

            return this.dropDown.hovering(item);
        }
    },

    /**
	 * 处理回车键。
     * @private
	 */
    _handlerEnter: function (next) {
        if (this.isDropDownHidden()) {
            return true;
        }

        // 交给下列菜单处理。
        this.dropDown.selectCallback(this.dropDown._hovering);
    },

    onItemClick: function (item) {
        this.selectCallback(item);
        return false;
    },

    /**
     * 设置当前下拉菜单的所有者。绑定所有者的相关事件。
     */
    constructor: function (options) {

        assert(options && options.owner && options.selectCallback, "DropDownMenu#constructor(options): {options} 必须有 owner 和 selectCallback 字段", options);
        
	    var me = this;

        // 创建原生节点。
	    me.node = options.node ? Dom.getNode(options.node) : me.create();
    	
    	// 执行父类的构造函数。
        ListControl.prototype.init.apply(me, arguments);
    	
    	// 设置鼠标移到某项后高亮某项。
        me.itemOn('mouseover', me.hovering);
        
        // 绑定下拉菜单的点击事件
        me.itemOn('mousedown', me.onItemClick);

        options.owner.keyNav({

            up: function () {
                me._handlerUpDown.call(this, false);
            },

            down: function () {
                me._handlerUpDown.call(this, true);
            },

            enter: me._handlerEnter,

            esc: options.owner.hideDropDown,

            other: options.updateCallback

        });

        me.selectCallback = options.selectCallback.bind(options.owner);
		
	},

    /**
     * 重新设置当前高亮项。
     */
	hovering: function (item) {
	    var clazz = 'x-' + this.xtype + '-hover';

	    if (this._hovering) {
	        this._hovering.removeClass(clazz);
	    }

	    this._hovering = item ? item.addClass(clazz) : null;
	    return this;
	}

});