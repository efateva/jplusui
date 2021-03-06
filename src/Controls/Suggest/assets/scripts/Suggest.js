/**
 * @author xuld
 */


using("Controls.Core.IDropDownOwner");
using("Controls.Suggest.DropDownMenu");

/**
 * 智能提示组件。
 * @extends Control
 */
var Suggest = Control.extend(IDropDownOwner).implement({

    /**
	 * 创建当前 Suggest 的菜单。
	 * @return {Dom} 下拉菜单。
	 * @protected virtual
	 */
    createDropDown: function (existDom) {
        return new DropDownMenu({
            node: existDom,
            owner: this,
            selectCallback: this.selectItem,
            updateCallback: this.showDropDown
        }).addClass('x-suggest');
    },

    /**
	 * 当下拉菜单被显示时执行。
     * @protected override
	 */
    onDropDownShow: function () {
		
	    var text = this.getText();
	    var items = this.getSuggestItems(text);

        // 如果智能提示的项为空或唯一项就是当前的项，则不提示。
	    if (!items || !items.length || (items.length === 1 && items[0] === text)) {
	        return this.hideDropDown();
	    }

	    this.dropDown.set(items);

        // 默认选择当前值。
	    this.dropDown.hovering(this.dropDown.item(0));

    },
	
    init: function(options){
		
        // 关闭原生的智能提示。
        this.setAttr('autocomplete', 'off')
        	
        	// 创建并设置提示的下拉菜单。
        	.setDropDown(this.createDropDown(this.next('x-suggest')))
			
			// 获取焦点后更新智能提示显示状态。
            .on('focus', this.showDropDown)
            
            // 失去焦点后隐藏菜单。
            .on('blur', function () {
                this.hideDropDown();
            });
		
    },

    /**
     * 根据当前的文本框值获取智能提示的项。
     */
	getSuggestItems: function(text){
	    if (!text) {
	        return this.suggestItems;
	    }

		text = text.toLowerCase();
		return this.suggestItems.filter(function (value) {
			return value.toLowerCase().indexOf(text) >= 0;
		});
	},
	
    /**
     * 强制设置当前选中的项。
     */
	setSuggestItems: function(value){
	    this.suggestItems = value || [];
		return this;
	},

    /**
     * 模拟用户选择一项。
     */
	selectItem: function (item) {
	    if (item) {
	        this.setText(item.getText());
	    }
	    return this.hideDropDown();
	}
	
});
