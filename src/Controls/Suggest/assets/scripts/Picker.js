/**
 * @author  xuld
 */

imports("Controls.Button.Button");
imports("Controls.Button.MenuButton");
imports("Controls.Suggest.Picker");
using("Controls.Core.Base");
using("Controls.Core.IInput");
using("Controls.Core.IDropDownOwner");

/**
 * 表示一个数据选择器。
 * @abstract class
 * @extends Control
 */
var Picker = Control.extend(IInput).implement(IDropDownOwner).implement({

    /**
	 * 当前控件是否为列表形式。如果列表模式则优先考虑使用下拉菜单。
     * @config {Boolean}
	 */
    listMode: true,

    /**
	 * 当前控件的 HTML 模板字符串。
	 * @getter {String} tpl
	 * @protected virtual
	 */
    tpl: '<span class="x-picker">\
			<input type="text" class="x-textbox"/>\
		</span>',

    /**
	 * 当前控件下拉按钮的 HTML 模板字符串。
	 * @getter {String} tpl
	 * @protected virtual
	 */
    menuButtonTpl: '<button class="x-button" type="button"><span class="x-menubutton-arrow"></span></button>',

    /**
	 * 获取当前控件的按钮部分。
	 */
    button: function () {
        return this.find('button');
    },

    /**
	 * 将当前文本的值同步到下拉菜单。
	 * @protected virtual
	 */
    updateDropDown: Function.empty,

    /**
	 * 当下拉菜单被显示时执行。
     * @protected override
	 */
    onDropDownShow: function () {
        // 默认选择当前值。
        this.updateDropDown();
        this.state('actived', true);
    },

    /**
	 * 当下拉菜单被隐藏时执行。
     * @protected override
	 */
    onDropDownHide: function () {
        this.state('actived', false);
    },

    /**
	 * 设置当前输入域的状态, 并改变控件的样式。
     * @param {String} name 状态名。常用的状态如： disabled、readonly、checked、selected、actived 。
     * @param {Boolean} value=false 要设置的状态值。
	 * @protected override
	 */
    state: function (name, value) {
        value = value !== false;
        if (name == "disabled" || name == "readonly") {

            // 为按钮增加 disabled 样式。
            this.query('.x-button,button').setAttr("disabled", value).toggleClass("x-button-disabled", value);

            // 为文本框增加设置样式。
            this.input().setAttr(name, value).toggleClass("x-textbox-" + name, value);

        } else if (name == "actived") {
            this.query('.x-button,button').toggleClass("x-button-actived", value);
        } else {
            IInput.state.call(this, name, value);
        }

    },

    /**
     * 创建当前组件的下拉菜单。
     * @param {Dom} existDom=null 已存在的 DOM 节点。
     * @return {Dom} 返回新创建的下拉菜单对象。
     * @protected virtual
     */
    createDropDown: function (existDom) {
        return existDom;
    },

    /**
	 * @protected
	 * @override
	 */
    init: function (options) {

        var me = this, elem;

        // 如果是 <input> 或 <a> 直接替换为 x-picker
        if (!me.first() && !me.hasClass('x-picker')) {
            elem = me.node;

            // 创建 x-picker 组件。
            me.node = Dom.createNode('span', 'x-picker x-' + me.xtype);

            // 替换当前节点。
            if (elem.parentNode) {
                elem.parentNode.replaceChild(me.node, elem);
            }

            // 插入原始 <input> 节点。
            me.prepend(elem);

        }

        // 如果没有下拉菜单按钮，添加之。
        if (!me.button()) {
            me.append(me.menuButtonTpl);
        }

        // 列表形式，则无法手动更改值，必须强制使用 listMode 。
        if ('listMode' in options) {
            me.listMode = options.listMode;
        } else if (me.first().node.tagName !== 'INPUT') {
            me.listMode = true;
        }

        // 初始化菜单。
        me.setDropDown(me.createDropDown(me.next('.x-dropdown')));

        // 设置菜单显示的事件。
        (me.listMode ? me : me.button()).on('click', me.toggleDropDown, me);
        
        if(me.listMode){
        	me.on('keyup', this.updateDropDown, this);
        }

    },

    setWidth: function (value) {
        var first = this.first();
        if (value >= 0) {
            value -= this.getWidth() - first.getWidth();
        }
        first.setWidth(value);
        return this;
    }

}).addEvents('change select', {
    add: function (picker, type, fn) {
        Dom.$event.$default.add(picker.input(), type, fn);
    },
    remove: function (picker, type, fn) {
        Dom.$event.$default.remove(picker.input(), type, fn);
    }
});

