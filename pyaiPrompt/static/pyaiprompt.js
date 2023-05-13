const topBar = document.querySelector('#topbar');  
const topSplitter = document.querySelector('#top-splitter');
const bottomSplitter = document.querySelector('#bottom-splitter');
const contextBox = document.querySelector('#context_box');
const outputBox = document.querySelector('#output_box');
const parentElement = document.querySelector('#div');
const codeBox = document.querySelector('#code_box');

let editor1 = CodeMirror.fromTextArea(codeBox, {
    lineNumbers: true,
    theme: 'mreq',
    mode: 'python'
});
let editor2 = CodeMirror.fromTextArea(outputBox, {
    lineNumbers: true,
    theme: 'mreq',
    mode: 'python'
});

let codeBoxWrapper = editor1.getWrapperElement();
let outputBoxWrapper = editor2.getWrapperElement();
        
codeBoxWrapper.style.height = '83%';
outputBoxWrapper.style.height = '5%';
// Use codeMirrorWrapper to modify the size or add a splitter
let totalHeight = window.innerHeight - topBar.offsetHeight - 15;
let minHeight = totalHeight * 0.05;
let maxHeight = totalHeight - minHeight * 2;
let remainingHeight = totalHeight - maxHeight;
let oneThirdHeight = totalHeight / 3;      

codeBoxWrapper.style.height = maxHeight - minHeight * 3 + 'px';
contextBox.style.height = minHeight * 3 + 'px';
outputBoxWrapper.style.height = minHeight * 2 + 'px';


let topSplitterDragging = false;
let bottomSplitterDragging = false;

outputBoxWrapper.readOnly = true;
        
        // Handle the top splitter drag event
        function onTopSplitterDrag(event) {
            // Calculate the new height of the top text box
            let newCodeBoxHeight = event.clientY - codeBoxWrapper.offsetTop;
            // Calculate the new height of the middle text box
            let newContextBoxHeight = contextBox.offsetHeight + (codeBoxWrapper.offsetHeight - newCodeBoxHeight);
            // Check if the new heights are within the allowed range
            if (newCodeBoxHeight >= minHeight && newContextBoxHeight >= minHeight) {
                // Update the heights of the top and middle text boxes
                codeBoxWrapper.style.height = newCodeBoxHeight + 'px';
                contextBox.style.height = newContextBoxHeight + 'px';
            } else if (newContextBoxHeight < minHeight) {
                // Calculate the remaining height for the top text box
                let remainingHeight = totalHeight - minHeight - outputBoxWrapper.offsetHeight;
                // Check if the remaining height is within the allowed range
                if (remainingHeight >= minHeight) {
                    // Calculate the difference between the minimum height and the new height of the middle text box
                    let delta = minHeight - newContextBoxHeight;
                    // Calculate the new height of the bottom text box
                    let newOutputBoxHeight = outputBoxWrapper.offsetHeight - delta;
                    // Check if the new height of the bottom text box is within the allowed range
                    if (newOutputBoxHeight >= minHeight) {
                        // Update the heights of all text boxes
                        outputBoxWrapper.style.height = newOutputBoxHeight + 'px';
                        contextBox.style.height = minHeight + 'px';
                        codeBoxWrapper.style.height = totalHeight - newOutputBoxHeight - minHeight + 'px';
                        if (bottomSplitterDragging) {
                            document.removeEventListener('mousemove', onBottomSplitterDrag);
                            bottomSplitterDragging = false;
                        }
                    }
                } 
            }
            originalRatios = {
                codeBoxRatio: codeBoxWrapper.offsetHeight / totalHeight,
                contextBoxRatio: contextBox.offsetHeight / totalHeight,
                outputBoxRatio: outputBoxWrapper.offsetHeight / totalHeight
            };
            
            editor1.refresh();
        }

        // Handle the bottom splitter drag event
        function onBottomSplitterDrag(event) {
            // Calculate the new height of the bottom text box
            let newOutputBoxHeight = outputBoxWrapper.offsetTop + outputBoxWrapper.offsetHeight - event.clientY;
            // Calculate the new height of the middle text box
            let newContextBoxHeight = contextBox.offsetHeight + (outputBoxWrapper.offsetHeight - newOutputBoxHeight);
            // Check if the new heights are within the allowed range
            if (newOutputBoxHeight >= minHeight && newContextBoxHeight >= minHeight) {
                // Update the heights of the bottom and middle text boxes
                outputBoxWrapper.style.height = newOutputBoxHeight + 'px';
                contextBox.style.height = newContextBoxHeight + 'px';
            } else if (newContextBoxHeight < minHeight) {
                // Calculate the remaining height for the bottom text box
                let remainingHeight = totalHeight - minHeight - codeBoxWrapper.offsetHeight;
                // Check if the remaining height is within the allowed range
                if (remainingHeight >= minHeight) {
                    // Calculate the difference between the minimum height and the new height of the middle text box
                    let delta = minHeight - newContextBoxHeight;
                    // Calculate the new height of the top text box
                    let newCodeBoxHeight = codeBoxWrapper.offsetHeight - delta;
                    // Check if the new height of the top text box is within the allowed range
                    if (newCodeBoxHeight >= minHeight) {
                        // Update the heights of all text boxes
                        codeBoxWrapper.style.height = newCodeBoxHeight + 'px';
                        contextBox.style.height = minHeight + 'px';
                        outputBoxWrapper.style.height = totalHeight - newCodeBoxHeight - minHeight + 'px';
                        // Check if the top splitter is currently being dragged
                        if (topSplitterDragging) {
                            // Remove the top splitter drag event listener
                            document.removeEventListener('mousemove', onTopSplitterDrag);
                            // Update the topSplitterDragging variable
                            topSplitterDragging = false;
                        }
                    } 
                }
            }
            originalRatios = {
            codeBoxRatio: codeBoxWrapper.offsetHeight / totalHeight,
            contextBoxRatio: contextBox.offsetHeight / totalHeight,
            outputBoxRatio: outputBoxWrapper.offsetHeight / totalHeight
        };
            editor2.refresh();
        }


        // Add an event listener for when the user starts dragging the top splitter
        topSplitter.addEventListener('mousedown', function() {
            // Add an event listener for when the user moves their mouse while dragging the top splitter
            document.addEventListener('mousemove', onTopSplitterDrag);
            // Update the topSplitterDragging variable
            topSplitterDragging = true;
            codeBoxWrapper.style.pointerEvents = 'none';
            outputBoxWrapper.style.pointerEvents = 'none';
            codeBoxWrapper.style.userSelect = 'none';
            outputBoxWrapper.style.userSelect = 'none';
            contextBox.style.userSelect = 'none';
        });

        // Add an event listener for when the user starts dragging the bottom splitter
        bottomSplitter.addEventListener('mousedown', function() {
            // Add an event listener for when the user moves their mouse while dragging the bottom splitter
            document.addEventListener('mousemove', onBottomSplitterDrag);
            // Update the bottomSplitterDragging variable
            bottomSplitterDragging = true;
            codeBoxWrapper.style.pointerEvents = 'none';
            outputBoxWrapper.style.pointerEvents = 'none';
            codeBoxWrapper.style.userSelect = 'none';
            outputBoxWrapper.style.userSelect = 'none';
            contextBox.style.userSelect = 'none';
        });

        // Add an event listener for when the user releases their mouse button
        document.addEventListener('mouseup', function() {
            // Remove the top and bottom splitter drag event listeners
            document.removeEventListener('mousemove', onTopSplitterDrag);
            document.removeEventListener('mousemove', onBottomSplitterDrag);
            // Update the topSplitterDragging and bottomSplitterDragging variables
            topSplitterDragging = false;
            bottomSplitterDragging = false;
            codeBoxWrapper.style.pointerEvents = 'auto';
            outputBoxWrapper.style.pointerEvents = 'auto';
            codeBoxWrapper.style.userSelect = 'auto';
            outputBoxWrapper.style.userSelect = 'auto';
            contextBox.style.userSelect = 'auto';
        });

let originalRatios = null;

window.addEventListener('resize', function() {
    totalHeight = window.innerHeight - topBar.offsetHeight - 15;
    minHeight = totalHeight * 0.05;
    maxHeight = totalHeight - minHeight * 2;
    
    if (!originalRatios) {
        originalRatios = {
            codeBoxRatio: codeBoxWrapper.offsetHeight / totalHeight,
            contextBoxRatio: contextBox.offsetHeight / totalHeight,
            outputBoxRatio: outputBoxWrapper.offsetHeight / totalHeight
        };
    }
    
    let codeBoxHeight = (window.innerHeight - topBar.offsetHeight) * originalRatios.codeBoxRatio;
    codeBoxHeight = Math.max(minHeight, Math.min(codeBoxHeight, maxHeight));
    
    let contextBoxHeight = (window.innerHeight - topBar.offsetHeight) * originalRatios.contextBoxRatio;
    contextBoxHeight = Math.max(minHeight, Math.min(contextBoxHeight, maxHeight));
    
    let outputBoxWrapperHeight = totalHeight - codeBoxHeight - contextBoxHeight;

    if (totalHeight > minHeight * 3) {
        codeBoxWrapper.style.height = codeBoxHeight + 'px';
        contextBox.style.height = contextBoxHeight + 'px';
        outputBoxWrapper.style.height = outputBoxWrapperHeight + 'px';
    }
    
    editor1.refresh(); editor2.refresh();
});

        [codeBoxWrapper, contextBox, outputBoxWrapper].forEach(box => {
            // Add an event listener for when the text box receives focus
            box.addEventListener('focus', function(e) {
                // Check if the text box is not readonly
                if (!box.readOnly) {
                    // Update the background color and outline of the text box
                    box.style.backgroundColor = '#2c2c2e';
                    box.style.outline = '2px solid rgba(0, 128, 0, 0.5)';
                } else {
                    // Prevent the default behavior of highlighting the text box
                    e.preventDefault();
                }
            });

            // Add an event listener for when the text box loses focus
            box.addEventListener('blur', function(e) {
                // Reset the background color and outline of the text box
                box.style.backgroundColor = '';
                box.style.outline = '';
                // Clear the value of the text box if it is empty
                if (box.value.trim() === '') {
                    box.value = '';
                }
            });
            
        // var gutters = document.querySelectorAll('.cm-s-mreq .CodeMirror-gutters');

            // Add an event listener for when the user double-clicks the text box
            box.addEventListener('dblclick', function(e) { 
                // Check which text box was double-clicked
                totalHeight = window.innerHeight - topBar.offsetHeight - 15;
                minHeight = totalHeight * 0.05;
                maxHeight = totalHeight - minHeight * 2;
                oneThirdHeight = totalHeight / 3;    
                if (box === codeBoxWrapper) {
                    if (codeBoxWrapper.style.height >= maxHeight - 5 + 'px') {
                        // Resize all text boxes to one third of the total height
                        codeBoxWrapper.style.height = oneThirdHeight + 'px';
                        contextBox.style.height = oneThirdHeight + 'px';
                        outputBoxWrapper.style.height = oneThirdHeight + 'px';
                    } else {
                        // Resize the text boxes
                        codeBoxWrapper.style.height = maxHeight - 2 + 'px';
                        contextBox.style.height = minHeight + 1 + 'px';
                        outputBoxWrapper.style.height = minHeight + 1 + 'px';
                    }
                    editor1.refresh();
                } else if (box === contextBox) {
                    if (contextBox.style.height >= maxHeight - 5 + 'px') {
                        // Resize all text boxes to one third of the total height
                        codeBoxWrapper.style.height = oneThirdHeight + 'px';
                        contextBox.style.height = oneThirdHeight + 'px';
                        outputBoxWrapper.style.height = oneThirdHeight + 'px';
                    } else {
                        // Resize the text boxes
                        codeBoxWrapper.style.height = minHeight + 1 + 'px';
                        contextBox.style.height = maxHeight - 2 + 'px';
                        outputBoxWrapper.style.height = minHeight + 1 + 'px';
                    }
                } else if (box === outputBoxWrapper) {
                    if (outputBoxWrapper.style.height >= maxHeight - 5 + 'px') {
                        // Resize all text boxes to one third of the total height
                        codeBoxWrapper.style.height = oneThirdHeight + 'px';
                        contextBox.style.height = oneThirdHeight + 'px';
                        outputBoxWrapper.style.height = oneThirdHeight + 'px';
                    } else {
                        // Resize the text boxes
                        codeBoxWrapper.style.height = minHeight + 1 + 'px';
                        contextBox.style.height = minHeight + 1 + 'px';
                        outputBoxWrapper.style.height = maxHeight - 2 + 'px';
                    }
                    editor2.refresh();
                }
                
                originalRatios = {
                    codeBoxRatio: codeBoxWrapper.offsetHeight / totalHeight,
                    contextBoxRatio: contextBox.offsetHeight / totalHeight,
                    outputBoxRatio: outputBoxWrapper.offsetHeight / totalHeight
                };
                
                topSplitterDragging = true;
                codeBoxWrapper.style.pointerEvents = 'none';
                outputBoxWrapper.style.pointerEvents = 'none';
                codeBoxWrapper.style.userSelect = 'none';
                outputBoxWrapper.style.userSelect = 'none';

            });
            
            document.addEventListener('keydown', function(e) {
                // Check if the user pressed the 'Ctrl + Alt + R' key combination
                if (e.ctrlKey && e.altKey && e.code === 'KeyR') {
                    // Check which text box is currently focused
                    var activeElement = document.activeElement;
                    if (activeElement.closest('.CodeMirror') === codeBoxWrapper) {
                        // Resize the text boxes
                        codeBoxWrapper.style.height = maxHeight + 'px';
                        contextBox.style.height = minHeight + 'px';
                        outputBoxWrapper.style.height = minHeight + 'px';
                        editor1.refresh();
                    } else if (activeElement === contextBox) {
                        // Resize the text boxes
                        codeBoxWrapper.style.height = minHeight + 'px';
                        contextBox.style.height = maxHeight + 'px';
                        outputBoxWrapper.style.height = minHeight + 'px';
                    } else if (activeElement.closest('.CodeMirror') === outputBoxWrapper) {
                        // Resize the text boxes
                        codeBoxWrapper.style.height = minHeight + 'px';
                        contextBox.style.height = minHeight + 'px';
                        outputBoxWrapper.style.height = maxHeight + 'px';
                        editor2.refresh();
                    }
                } else if (e.ctrlKey && e.altKey && e.code === 'KeyE') {
                    // Resize all text boxes to one third of the total height
                    codeBoxWrapper.style.height = oneThirdHeight + 'px';
                    contextBox.style.height = oneThirdHeight + 'px';
                    outputBoxWrapper.style.height = oneThirdHeight + 'px';
                } else if (e.ctrlKey && e.altKey && e.code === 'Digit1') {
                    // Focus on the code box
                    editor1.focus();
                } else if (e.ctrlKey && e.altKey && e.code === 'Digit2') {
                    // Focus on the context box
                    contextBox.focus();
                } else if (e.ctrlKey && e.altKey && e.code === 'Digit3') {
                    // Focus on the output box
                    editor2.focus();
                }
            });
                    
            
            // Load the saved text from localStorage when the page is loaded
            window.addEventListener('load', function() {
                
                let codeBoxHeight = localStorage.getItem('codeBoxHeight');
                let contextBoxHeight = localStorage.getItem('contextBoxHeight');
                let outputBoxHeight = localStorage.getItem('outputBoxHeight');
                //splitter.syle.height = '8px';
                if (codeBoxHeight && contextBoxHeight && outputBoxHeight) {
                    codeBoxWrapper.style.height = codeBoxHeight + 'px';
                    contextBox.style.height = contextBoxHeight + 'px';
                    outputBoxWrapper.style.height = outputBoxHeight + 'px';
                    editor1.refresh(); editor2.refresh();

                }
                
                var savedCode = localStorage.getItem('code');
                if (savedCode) {
                    editor1.setValue(savedCode);
                }

                var savedOutput = localStorage.getItem('output');
                if (savedOutput) {
                    editor2.setValue(savedOutput);
                }
            });

            // Save the text to localStorage when the page is unloaded
            window.addEventListener('beforeunload', function() {
                
                localStorage.setItem('codeBoxHeight', codeBoxWrapper.offsetHeight);
                localStorage.setItem('contextBoxHeight', contextBox.offsetHeight);
                localStorage.setItem('outputBoxHeight', outputBoxWrapper.offsetHeight);
                
                var code = editor1.getValue();
                localStorage.setItem('code', code);

                var output = editor2.getValue();
                localStorage.setItem('output', output);
            });
            
        });
        
                function updateTitle() {
            let title = document.getElementById("titleInput").value;
            document.title = title;
        }
        function handleFileSelect() {
            var file = document.getElementById("fileInput").files[0];
            var reader = new FileReader();
            reader.onload = function(e) {
                var text = e.target.result;
                // Update the contents of the CodeMirror editor with the text from the selected file
                editor1.setValue(text);
            };
            reader.readAsText(file);
                
            // Update the value of the input element with the name of the selected file
            document.getElementById("titleInput").value = file.name;
            document.title = file.name
        }
        function handleSaveAs() {
            var text = editor1.getValue();
            var defaultFilename = document.getElementById("titleInput").value;
            console.log(defaultFilename )
            if (defaultFilename === "pyaiPrompt") {
                defaultFilename = "";
            } else {
                defaultFilename = "pyai_" + defaultFilename;
            }
            var filename = prompt("Enter a filename:", defaultFilename);
            if (filename === null) {
                // User clicked cancel
                return;
            }
            var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
            saveAs(blob, filename);
        }

	
        function swapCode() {
            orig1 = editor1.getValue();
            orig2 = editor2.getValue();
            
            editor1.setValue(orig2);
            editor2.setValue(orig1);
        }
        
        function removeComments() {
            // Get the value of the editor
            let str = editor1.getValue();
            // Define regular expressions to match single line comments, multi line comments and docstrings
            // Use negative lookbehind and lookahead to exclude strings that are inside single or double quotes
            let singleLineComment = /(?<!['"])#(?![^'"\n]*['"])[^\n]*/g;
            let multiLineComment = /(?<!['"])"""\s*[\s\S]*?\s*"""(?!\n['"])/g;
            let docstring = /(?<!['"])'''\s*[\s\S]*?\s*'''(?!\n['"])/g;
            // Replace the matched patterns with empty strings
            str = str.replace(singleLineComment, "");
            str = str.replace(multiLineComment, "");
            str = str.replace(docstring, "");
            // Define a regular expression to match blank lines
            // Use ^ and $ to match the beginning and end of a line
            // Use \s* to match any whitespace characters
            // Use \r?\n to match a newline character with optional carriage return
            // Use g and m flags to match globally and across multiple lines
            let blankLine = /^\s*\r?\n/gm;
            // Replace the matched patterns with empty strings
            str = str.replace(blankLine, "");
            // Return the modified string
            editor1.setValue(str);
        }

	    function debugPrompt() {
		    pyaiPrompt("debug");
        }
        
        function codePrompt() {
        	pyaiPrompt("code");
        }
        
        function pyaiPrompt(pyaiType) {
            // Get the code and context from editor1 and contextBox
            let code = editor1.getSelection();
            if (code === '') {
                code = editor1.getValue();
                code = code.replace(/\+/g, "@PLUS@#@SIGN@");
            }
            let context = contextBox.value;

            // Set the value of editor2 to "Generating..." and disable it
            editor2.setValue('Generating...');
            editor2.setOption('readOnly', true);

            // Create a new XMLHttpRequest object
            let xhr = new XMLHttpRequest();

            // Initialize a POST request to the /save_files route
            xhr.open('POST', '/save_files');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

            // Define an onload event handler for the XMLHttpRequest object
            xhr.onload = function() {
                if (xhr.status === 200) {
                    // Get the vmoutput from the responseText property of the XMLHttpRequest object
                    let vmoutput = xhr.responseText;

                    // Update the value of editor2 with the vmoutput and re-enable it
                    editor2.setOption('readOnly', false);
                    editor2.setValue(vmoutput);
                    

                    // Re-enable all buttons inside the input_heading container
                    $('#input_heading button').prop('disabled', false);

                    // Change the cursor back to the default cursor
                    $('body').css('cursor', 'default');
                }
            };

            // Send the request to the server with the code and context data as parameters
            xhr.send(encodeURI('code=' + code + '&context=' + context + '&pyaiType=' + pyaiType));

            // Disable all buttons inside the input_heading container
            $('#input_heading button').prop('disabled', true);

            // Change the cursor to a wait cursor
            $('body').css('cursor', 'wait');
        }
