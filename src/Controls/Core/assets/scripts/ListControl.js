/**
 * @author  xuld
 */


using("Controls.Core.Base");


/**
 * 表示所有管理多个有序列的子控件的控件基类。
 * @abstract class
 * @extends Control
 */
var ListControl = Control.extend({

    /**
	 * 当前控件的 HTML 模板字符串。
	 * @getter {String} tpl
	 * @protected virtual
	 */
	tpl: '<ul class="x-control"/>',
	
	// 内部实现的项操作
		
	/**
	 * 当新控件被添加时执行。
	 * @param {Dom} childControl 新添加的元素。
	 * @param {Dom} refControl 元素被添加的位置。
	 * @protected override
	 */
	insertBefore: function(childControl, refControl) {
		
		// 如果 childControl 不是 <li>, 则包装一个 <li> 标签。
		if (childControl.node.tagName !== 'LI') {

			// 创建 <li>
			var li = Dom.create('LI');
			
			// 复制节点。
			li.append(childControl);
			
			// 赋值。
			childControl = li;
		}
		
		// 插入 DOM 树。
		childControl.attach(this.node, refControl && refControl.node || null);
			
		// 返回新创建的子控件。
		return childControl;
	},

	/**
	 * 当新控件被移除时执行。
	 * @param {Dom} childControl 新添加的元素。
	 * @protected override
	 */
	removeChild: function(childControl) {
		
		// 如果 childControl 不是 <li>, 则退出 <li> 的包装。
		if (childControl.node.parentNode !== this.node) {
			
			// 获取包装的 <li>
			var li = childControl.parent();
			
			// 不存在 li 。
			if(!li) {
				return null;
			}
			
			// 删除节点。
			childControl.detach(li.node);
			
			// 赋值。
			childControl = li;
		}
		
		// 从 DOM 树删除。
		childControl.detach(this.node);
		
		// 返回被删除的子控件。
		return childControl;
	},
	
	// 项操作

	/**
	 * 添加一个子控件到当前控件末尾。
	 * @param {Dom} ... 要添加的子控件。
	 * @return {Dom/this} 返回新添加的子控件，如果有多个参数，则返回 this。
	 */
	add: function() {
		var args = arguments;
		if (args.length === 1) {
			return this.append(args[0]);
		}

		Object.each(args, this.append, this);
		return this;
	},

	/**
	 * 在指定位置插入一个子控件。
	 * @param {Integer} index 添加的子控件的索引。
	 * @param {Dom} item 要添加的子控件。
	 * @return {Dom} 返回新添加的子控件。
	 */
	addAt: function(index, item) {
	    return this.insertBefore(Dom.parse(item), this.child(index));
	},

	/**
	 * 删除指定索引的子控件。
	 * @param {Integer} index 删除的子控件的索引。
	 * @return {Dom} 返回删除的子控件。如果删除失败（如索引超出范围）则返回 null 。
	 */
	removeAt: function(index) {
		var child = this.child(index);
		return child ? this.removeChild(child) : null;
	},
	
	/**
	 * 批量设置当前的项列表。
     * @param {Array/Object} items 要设置的项的数组。
     * @return this
     * @protected override
	 */
	set: function(items){
		if(Array.isArray(items)){
			this.empty();
			this.add.apply(this, items);
			return this;
		}
		
		return Dom.prototype.set.apply(this, arguments);
	},
	
	/**
	 * 获取指定索引的项。
	 * @param {Integer} index 索引值。如果值小于 0, 则表示倒数的项。
	 * @return {Dom} 指定容器控件包装的真实子控件。如果不存在相应的子控件，则返回自身。
	 */
	item: Dom.prototype.child,

	/**
	 * 获取某一项在列表中的索引。
     * @param {Dom} item 要获取索引的项。
	 * @return {Integer} 返回索引。如果不存在指定的子控件，则返回 -1 。
	 */
	indexOf: function(item) {
		return item && item.parent && this.equals(item.parent()) ? item.index() : -1;
	},

	/**
	 * 设置子控件某个事件发生之后，执行某个函数.
	 * @param {String} eventName 事件名。
	 * @param {String} fn 执行的函数。
	 * @param {Object} scope 函数执行时的作用域。
     * @return this
	 */
	itemOn: function(eventName, fn, scope){
		return this.on(eventName, function(e){
		    for (var c = this.node.firstChild, target = e.target; c; c = c.nextSibling) {
				if(c === target || Dom.has(c, target)){
				    return fn.call(scope || this, new Dom(c), e);
				}
			}
		});
	}

});

/**
 * 为非 ListControl 对象扩展 ListControl 的6个方法: add addAt remove removeAt set item
 */
ListControl.aliasMethods = function(controlClass, targetProperty, removeChildProperty){
    controlClass.defineMethods(targetProperty, 'add addAt removeAt item');

    removeChildProperty = removeChildProperty || targetProperty;

    controlClass.prototype.set = function (items) {
        if (Array.isArray(items)) {

            // 尝试在代理的列表中删除项。
            var child = this[removeChildProperty];
            if (child)
                child.empty();

            // 通过 this.add 添加项。
            this.add.apply(this, items);

            return this;
        }

        return this.base('set');
    };
	
	controlClass.prototype.removeChild = function(childControl){
		
		// 尝试在代理的列表中删除项。
		var child = this[removeChildProperty];
		if(child)
			childControl.remove(childControl);
		
		// 尝试在当前节点中正常删除。
		childControl.detach(this.node);
		
		return childControl;
	};
	
};