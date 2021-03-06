/**
 * @author xuld
 */


/**
 * 验证一个字段的工具。
 */
var Validator = Class({

    event: 'keyup',

    tipDuration: 100,

    isValidated: function () {
        return this.validate() === '';
    },

    updateState: function (success, message) {

        var target = this.target,
            tip = this.tip;

        if (tip) {
            if (!success) {
                if (message == null) {
                    tip.setHtml(Validator.messages.waiting).node.className = 'x-tipbox x-tipbox-info';
                    tip.show(this.tipDuration);
                    success = true;
                } else {
                    tip.setHtml(message).node.className = 'x-tipbox x-tipbox-error';
                    tip.show(this.tipDuration);
                }
            } else if (message) {
                tip.setHtml(message).node.className = 'x-tipbox x-tipbox-success';
                tip.show(this.tipDuration);
            } else {
                tip.setHtml('&nbsp;').node.className = 'x-tipbox x-tipbox-success x-tipbox-plain';
                if (message === '')
                    tip.show(this.tipDuration);
                else
                    tip.hide();
            }
        }

        if (target.hasClass('x-textbox')) {
            if (success) {
                target.removeClass('x-textbox-error');
            } else {
                target.addClass('x-textbox-error');
            }
        }

    },

    onValidate: function () {
        var me = this;
        if (me._timer) {
            clearTimeout(me._timer);
        }

        me._timer = setTimeout(function () {
            me._timer = 0;
            me.validate();
        }, 200);
    },

    getText: function () {
        return this.target.getText().trim();
    },

    constructor: function (options) {

        // 自动填充一些属性。
        var me = Object.extend(this, options),
            target = me.target,
            t = me.event;

        assert.notNull(target, "Validator#constructor(options): {options.target} ~");

        me.tip = me.tip || target.next('.x-tipbox');

        // 验证类型。
        if (t) {
            target.on(t, this.onValidate, this);

            // 如果是 keyup 进行的验证，还需要在 blur 时执行。
            if (t === 'keyup') {
                target.on('blur', this.onValidate, this);
            }
        }

        // 第一次验证。
        if (me.getText()) {
            me.validate();
        } else {
            me.reset();
        }
    },

    /**
     * 对当前字段进行验证。并返回相应的结果。
     */
    validate: function () {

        var me = this,
            rule,
            text = me.getText(),
            errorMessage = '',
            t,
            messages = me.messages;

        // 如果验证已经成功，则无需验证。
        if (text === this._validatedText) {
            return '';
        }

        // 如果存在开始验证的回调，则调用。
        if (me.start) {
            me.start();
        }

        for (rule in me.rules) {

            // 如果这是一个需要验证的字段。
            // 执行验证器，并返回验证错误信息。
            // 如果验证信息存在内容，则显示错误信息。
            // 如果错误信息是 null ，则表示正在异步验证，此时应该忽略掉 validated 的调用。
            if ((text || rule === 'required') && (t = Validator.defaultValidators[rule]) && (errorMessage = t.call(me, text, me.rules[rule], messages && messages[rule] || Validator.messages[rule])) != '') {

                break;
            }

        }

        // 清除错误信息。
        if (errorMessage) {
            this.validated(errorMessage, rule);
        } else if (errorMessage != null) {
            this.validated(messages && ('success' in messages) ? messages.success : errorMessage);
        }
        
        return errorMessage;

    },

    /**
     * 通知验证器验证结果。
     */
    validated: function (message, rule) {

        var me = this,
            success = !message;

        // 显示错误信息。
        this.updateState(success, message);

        if (success) {
            me._validatedText = me.getText();
            if (me.success) {
                me.success(message);
            }
        } else {
            me._validatedText = null;
            if (me.error) {
                me.error(message, rule);
            }
        }

        if (me.complete) {
            me.complete(errorMessage, rule);
        }

        // 如果当前字段关联的一个表单，且这个表单因为当前字段正在验证而导致的阻止提交时间，那么重新提交表单。
        if (me.form && me.form.delaySubmit && me.form.errorFields) {
            me.form.errorFields.remove(this);
            if (!me.form.errorFields.length) {
                me.form.errorFields = [];
                me.form.target.submit();
            }
        }

    },

    reset: function () {
        this._validatedText = null;
        this.updateState(true, null);
        return this;
    }

});


/**
 * 验证一个表单的工具。
 */
Validator.Form = Class({

    event: 'submit',

    delaySubmit: true,

    onValidate: function () {
        return this.validate().length === 0;
    },

    constructor: function (options) {

        var me = Object.extend(this, options),
            target = me.target,
            rule,
            t;

        // 创建每个 rules 的子 Validator 。
        for (rule in me.rules) {
            t = me.rules[rule];
            t.target = t.target || target.query('[name="' + fieldName + '"]');
            me.rules[rule] = new Validator(t);
        }

        if (this.event) {
            target.on(this.event, this.onValidate, this);
        }

    },
    
    /**
     * 对当前字段进行验证。并返回相应的结果。
     */
    validate: function () {

        var me = this,
            errorFields = [],
            field,
            errorMessage = '';

        // 如果存在开始验证的回调，则调用。
        if (me.start) {
            me.start();
        }

        for (field in me.rules) {
            if (!me.rules[field].isValidated()) {
                errorFields.push(me.rules[field]);
                me.rules[field].form = me;

                if (me.error) {
                    me.error(errorMessage, field, me.rules[field]);
                }
            }
        }

        if (errorFields.length > 0){
            me.errorFields = errorFields;
        } else if(me.success) {
            me.success();
        }

        if (me.complete) {
            me.complete(errorFields);
        }

        return errorFields;
    },

    reset: function () {

        var field,
            errorMessage;

        for (field in this.rules) {
            this.rules[field].reset();
        }

        return this;
    }

});

Validator.defaultValidators = {

    required: function (text, args, errorMessage) {
        return !args || text ? '' : errorMessage;
    },

    maxLength: function (text, args, errorMessage) {
        return text.length <= args ? '' : String.format(errorMessage, args, text.length, text.length - args);
    },

    minLength: function (text, args, errorMessage) {
        return text.length >= args ? '' : String.format(errorMessage, args, text.length, args - text.length);
    },

    pattern: function (text, args, errorMessage) {
        return args.exec(text) ? '' : errorMessage;
    },

    type: function (text, args, errorMessage) {
        return Validator.types[args].exec(text) ? '' : (errorMessage || Validator.messages[args]);
    },

    range: function (text, args, errorMessage) {
        return type >= args && text <= args ? '' : errorMessage;
    },

    equalsTo: function (text, args, errorMessage) {
        return args.getText() === text ? '' : errorMessage;
    },

    other: function (text, args, errorMessage) {
        return args.call(this, text, this.validated.bind(this));
    }

};

Validator.types = {

    number: /^[+-\.\d]*$/,

    integer: /^\d+$/,

    letter: /^\w*$/,

    email: /^.+@.+(\..+)+/,

    id: /^\d{15}$|^\d{17}(?:\d|x|X)$/,

    qq: /^\d{5,12}$/,

    phone: /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/,

    mobile: /^\d{11}$/,

    url: /^http:\/\//i

};

Validator.messages = {

    required: '此项为必填项',

    maxLength: '最多只能有 {0} 个字符',

    minLength: '至少需要 {0} 个字符',

    pattern: '格式不正确',

    range: '必须在值 {0} 和 {1} 之间',

    equalsTo: '2次密码必须相同',

    waiting: '正在验证...',

    number: '只能填写数字',

    integer: '只能填写整数',

    letter: '只能填写字母和数字',

    email: '请填写有效的邮箱地址。',

    id: '请填写正确的身份证',

    qq: '请填写有效的 QQ 号码',

    phone: '请填写正确的号码',

    mobile: '请填写正确的手机号码',

    url: '请填写正确的地址。地址以 http:// 开头'

};