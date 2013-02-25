var global = this;
$(function()
{
    var attachCustomSelect = function(selectEl, callbacks)
    {
        var options = selectEl.options;
        var optionsLength = options.length;
        var optionsTexts = new Array(optionsLength);
        var selectedIndex = selectEl.selectedIndex;

        var $fakeSelectEl = $(document.createElement('div'));
        var $selectedText = $(document.createElement('p'));
        var $$fakeOptions = $(document.createElement('ul'));

        var isOpen = false;

        callbacks = callbacks || {};
        var onChange = callbacks.onChange;
        var onOpen = callbacks.onOpen;
        var onClose = callbacks.onClose;
        var onFocus = callbacks.onFocus;

        var $selectEl = $(selectEl);
        var onChangeAttr = $selectEl.attr('onchange');

        $fakeSelectEl.addClass('custom-select');

        var fakeOpt, fakeOpts = [];
        for(var i = 0, l = optionsLength; i < l; ++i)
        {
            optionsTexts[i] = $(options[i]).text();

            fakeOpt = document.createElement('li');
            fakeOpt.appendChild(
                document.createTextNode(optionsTexts[i])
            );

            fakeOptions.appendChild(fakeOpt);
            fakeOpts.push(fakeOpt);
        }

        $selectedText.append(
            document.createTextNode(optionsTexts[selectedIndex])
        );

        $fakeSelectEl.append(selectedText);
        $fakeSelectEl.append(fakeOptions);
        $fakeOptions.hide();
        //API.setStyle(selectedText, 'height', '100%');

        selectEl.parentNode.appendChild(fakeSelectEl);

        //API.overlayElement(fakeSelectEl, selectEl, true);
        $selectEl.hide();

        var close = function(e)
        {
            if(isOpen)
            {
                $fakeOptions.hide();
                API.detachListener(rootEl, 'click', close);
                API.detachListener(rootEl, 'keydown', keyboardHandler);
                isOpen = false;

                if(typeof e != 'undefined' || focusedEl !== null)
                {
                    var target = typeof e == 'undefined' ? focusedEl : API.getEventTarget(e);

                    if(focusedEl !== null)
                    {
                        API.removeClass(focusedEl, 'focused');
                        focusedIndex = focusedEl = null;
                    }

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

                        var oldSelected = selectEl.selectedIndex;
                        selectEl.selectedIndex = clickedIndex;
                        if(oldSelected !== clickedIndex)
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

                        API.emptyNode(selectedText);
                        selectedText.appendChild(
                            document.createTextNode(optionsTexts[clickedIndex])
                        );
                    }
                }

                if(typeof onClose == 'function')
                {
                    onClose.call(fakeSelectEl);
                }
            }
        };

        var doc = API.getElementDocument(selectEl);
        var $rootEl = $(document.documentElement);
        var attachRootClickListener = function()
        {
            $rootEl.on('click', close)
        };

        API.attachListener(fakeOptions, 'click', close);

        var alphaNumRE = new RegExp('[0-9a-zA-Z]');
        var focusedEl = null;
        var focusedIndex = null;
        var keyboardHandler = function(e)
        {
            var key = API.getKeyboardKey(e);
            API.cancelDefault(e);
            switch(key)
            {
                case 38:
                    focusUp();
                    break;
                case 40:
                    focusDown();
                    break;
                case 27:
                    if(focusedEl !== null)
                    {
                        API.removeClass(focusedEl, 'focused');
                    }
                    focusedEl = null;
                case 13:
                    close();
                    break;
                default:
                    var charPressed = String.fromCharCode(key);
                    if(alphaNumRE.test(charPressed))
                    {
                        focusOptionWith(charPressed);
                    }
            }
        };

        var focusUp = function()
        {
            if(!focusedIndex)
            {
                return;
            }

            focusOption(--focusedIndex);
        };

        var maxIndex = fakeOpts.length - 1;
        var focusDown = function()
        {
            if(focusedIndex === maxIndex)
            {
                return;
            }
            else if(focusedEl === null)
            {
                focusedIndex = -1;
            }

            focusOption(++focusedIndex);
        };

        var focusOptionWith = function(charPressed)
        {
            charPressed = charPressed.toLowerCase();
            var i = 0;
            if(focusedIndex && optionsTexts[focusedIndex].charAt(0).toLowerCase() == charPressed)
            {
                i = focusedIndex;
            }

            for(var l = optionsLength; i < l; ++i)
            {
                if(optionsTexts[i].charAt(0).toLowerCase() === charPressed)
                {
                    if(
                        focusedIndex !== null &&
                            optionsTexts[focusedIndex].charAt(0).toLowerCase() === charPressed
                        )
                    {
                        while(
                            optionsTexts[i + 1] &&
                                optionsTexts[i + 1].charAt(0).toLowerCase() !== charPressed
                            )
                        {
                            ++i;
                        }
                        if(
                            optionsTexts[++i] &&
                                optionsTexts[i].charAt(0).toLowerCase() === charPressed
                            )
                        {
                            focusOption(i);
                            break;
                        }

                        for(var j = 0; j < i; ++j)
                        {
                            if(optionsTexts[j].charAt(0).toLowerCase() === charPressed)
                            {
                                focusOption(j);
                                break;
                            }
                        }
                    }
                    else
                    {
                        focusOption(i);
                        break;
                    }
                }
            }
        };

        var focusOption = function(index)
        {
            if(focusedEl !== null)
            {
                API.removeClass(focusedEl, 'ativo');
            }

            var up = focusedIndex > index;

            focusedEl = fakeOpts[focusedIndex = index];
            API.addClass(focusedEl, 'ativo');
            if(typeof onFocus == 'function')
            {
                onFocus(focusedIndex, up);
            }
        };

        $fakeSelectEl.on(
            'click',
            function(e)
            {
                if(!isOpen && !$.contains($fakeOptions[0], e.target))
                {
                    $fakeOptions.show();
                    global.setTimeout(attachRootClickListener, 1);
                    $rootEl.on('keydown', keyboardHandler);
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
