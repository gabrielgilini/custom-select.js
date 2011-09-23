var global = this;
API.attachDocumentReadyListener(function()
{
    var attachCustomSelect = function(selectEl, callbacks)
    {
        var options = selectEl.options;
        var optionsLength = options.length;
        var optionsTexts = new Array(optionsLength);
        var selectedIndex = selectEl.selectedIndex;

        var fakeSelectEl = document.createElement('div');
        var selectedText = document.createElement('p');
        var fakeOptions = document.createElement('ul');

        var isOpen = false;

        callbacks = callbacks || {};
        var onChange = callbacks.onChange;
        var onOpen = callbacks.onOpen;
        var onClose = callbacks.onClose;

        var onChangeAttr = API.getAttributeProperty(selectEl, 'onchange');

        fakeSelectEl.className = 'custom-select';

        var fakeOpt, fakeOpts = [];
        for(var i = 0, l = optionsLength; i < l; ++i)
        {
            optionsTexts[i] = API.getElementText(options[i]);

            fakeOpt = document.createElement('li');
            fakeOpt.appendChild(
                document.createTextNode(optionsTexts[i])
            );

            fakeOptions.appendChild(fakeOpt);
            fakeOpts.push(fakeOpt);
        }

        selectedText.appendChild(
            document.createTextNode(optionsTexts[selectedIndex])
        );

        fakeSelectEl.appendChild(selectedText);
        fakeSelectEl.appendChild(fakeOptions);
        API.presentElement(fakeOptions, false);
        API.setStyle(selectedText, 'height', '100%');

        selectEl.parentNode.appendChild(fakeSelectEl);

        API.overlayElement(fakeSelectEl, selectEl, true);
        API.presentElement(selectEl, false);

        var close = function(e)
        {
            if(isOpen)
            {
                var target = API.getEventTarget(e);

                API.presentElement(fakeOptions, false);
                API.detachListener(rootEl, 'click', close);
                isOpen = false;

                if(API.isDescendant(fakeOptions, target))
                {
                    while(API.getElementNodeName(target) != 'li')
                    {
                        target = target.parentNode;
                    }

                    var clickedIndex = 0;
                    while(fakeOpts[clickedIndex] !== target)
                    {
                        ++clickedIndex;
                    }

                    if(selectEl.selectedIndex !== clickedIndex)
                    {
                        if(typeof onChange == 'function')
                        {
                            onChange.call(selectEl);
                        }
                        if(typeof onChangeAttr == 'function')
                        {
                            onChangeAttr.call(selectEl);
                        }
                    }
                    selectEl.selectedIndex = clickedIndex;
                    API.emptyNode(selectedText);
                    selectedText.appendChild(
                        document.createTextNode(optionsTexts[clickedIndex])
                    );
                }
                if(typeof onClose == 'function')
                {
                    onClose.call(fakeSelectEl);
                }
            }
        };

        var doc = API.getElementDocument(selectEl);
        var rootEl = API.getHtmlElement(doc) || API.getBodyElement(doc);
        var attachRootClickListener = function()
        {
            API.attachListener(rootEl, 'click', close)
        };

        API.attachListener(fakeOptions, 'mousedown', close);

        API.attachListener(
            fakeSelectEl,
            'click',
            function(e)
            {
                var target = API.getEventTarget(e);

                if(!isOpen)
                {
                    API.presentElement(fakeOptions, true);
                    global.setTimeout(attachRootClickListener, 1);
                    isOpen = true;

                    if(typeof onOpen == 'function')
                    {
                        onOpen.call(fakeSelectEl);
                    }
                }
            }
        );
    };

    API.attachCustomSelect = attachCustomSelect;
});
