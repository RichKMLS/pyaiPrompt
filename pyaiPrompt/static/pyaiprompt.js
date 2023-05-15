const topBar = document.querySelector('#topbar');  
const topSplitter = document.querySelector('#top-splitter');
const bottomSplitter = document.querySelector('#bottom-splitter');
const contextBox = document.querySelector('#context_box');
const outputBox = document.querySelector('#output_box');
const parentElement = document.querySelector('#div');
const codeBox = document.querySelector('#code_box');
const container = document.querySelector("#topbar");
const draggable = document.querySelector("#draggable");
const handle = document.querySelector("#handle");
const containerHeight = container.offsetHeight;

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

codeBoxWrapper.style.zIndex = "0";
outputBoxWrapper.style.zIndex = "0";
    
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
   
// This function handles the dragging event of the bottom splitter
// It adjusts the heights of the output box, context box and code box accordingly
// It also refreshes the editor and removes the top splitter event listener if needed
function onBottomSplitterDrag(event) {
  // Calculate the new height of the output box based on the mouse position
  let newOutputBoxHeight = outputBoxWrapper.offsetTop + outputBoxWrapper.offsetHeight - event.clientY;
  // Calculate the new height of the context box based on the output box height
  let newContextBoxHeight = contextBox.offsetHeight + (outputBoxWrapper.offsetHeight - newOutputBoxHeight);
  // Check if both heights are above the minimum height
  if (newOutputBoxHeight >= minHeight && newContextBoxHeight >= minHeight) {
    // Set the new heights for both boxes
    outputBoxWrapper.style.height = newOutputBoxHeight + 'px';
    contextBox.style.height = newContextBoxHeight + 'px';
  } else if (newContextBoxHeight < minHeight) {
    // If the context box height is below the minimum, adjust it to the minimum
    // and distribute the remaining height between the output box and code box
    let remainingHeight = totalHeight - minHeight - codeBoxWrapper.offsetHeight;
    if (remainingHeight >= minHeight) {
      // Calculate the delta between the minimum and actual context box height
      let delta = minHeight - newContextBoxHeight;
      // Calculate the new code box height by subtracting the delta
      let newCodeBoxHeight = codeBoxWrapper.offsetHeight - delta;
      if (newCodeBoxHeight >= minHeight) {
        // Set the new heights for all three boxes
        codeBoxWrapper.style.height = newCodeBoxHeight + 'px';
        contextBox.style.height = minHeight + 'px';
        outputBoxWrapper.style.height = totalHeight - newCodeBoxHeight - minHeight + 'px';
        // If the top splitter is being dragged, remove its event listener and set its flag to false
        if (topSplitterDragging) {
          document.removeEventListener('mousemove', onTopSplitterDrag);
          topSplitterDragging = false;
        }
      }
    }
  }
  // Update the original ratios for each box based on their heights and total height
  originalRatios = {
    codeBoxRatio: codeBoxWrapper.offsetHeight / totalHeight,
    contextBoxRatio: contextBox.offsetHeight / totalHeight,
    outputBoxRatio: outputBoxWrapper.offsetHeight / totalHeight
  };
  // Refresh the editor to reflect the changes
  editor2.refresh();
}   
         
// This function adjusts the heights of the code box, context box and output box when the top splitter is dragged
function onTopSplitterDrag(event) {
  // Get the new height of the code box based on the mouse position
  let newCodeBoxHeight = event.clientY - codeBoxWrapper.offsetTop;
  // Get the new height of the context box based on the difference between the old and new heights of the code box
  let newContextBoxHeight = contextBox.offsetHeight + (codeBoxWrapper.offsetHeight - newCodeBoxHeight);
  // Check if both heights are above the minimum height
  if (newCodeBoxHeight >= minHeight && newContextBoxHeight >= minHeight) {
    // Set the new heights for both boxes
    codeBoxWrapper.style.height = newCodeBoxHeight + 'px';
    contextBox.style.height = newContextBoxHeight + 'px';
  } else if (newContextBoxHeight < minHeight) {
    // If the context box height is below the minimum height, adjust the output box height accordingly
    let remainingHeight = totalHeight - minHeight - outputBoxWrapper.offsetHeight;
    if (remainingHeight >= minHeight) {
      let delta = minHeight - newContextBoxHeight;
      let newOutputBoxHeight = outputBoxWrapper.offsetHeight - delta;
      if (newOutputBoxHeight >= minHeight) {
        // Set the new heights for all three boxes
        outputBoxWrapper.style.height = newOutputBoxHeight + 'px';
        contextBox.style.height = minHeight + 'px';
        codeBoxWrapper.style.height = totalHeight - newOutputBoxHeight - minHeight + 'px';
        // If the bottom splitter was being dragged, stop it and remove the event listener
        if (bottomSplitterDragging) {
          document.removeEventListener('mousemove', onBottomSplitterDrag);
          bottomSplitterDragging = false;
        }
      }
    }
  }
  // Update the original ratios for each box based on their heights
  originalRatios = {
    codeBoxRatio: codeBoxWrapper.offsetHeight / totalHeight,
    contextBoxRatio: contextBox.offsetHeight / totalHeight,
    outputBoxRatio: outputBoxWrapper.offsetHeight / totalHeight
  };
  // Refresh the editor
  editor1.refresh();
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
        
// This function removes all comments and unnecessary whitespace from the code in the editor
function removeComments() {
    // Get the value of the editor as a string
    let str = editor1.getValue();
    
    // Define regular expressions for different types of comments and whitespace
    // Use negative lookbehind and lookahead to avoid matching strings inside quotes  
    let leadingTrailingSpace = /\n/g; // matches newline characters
    let lines = str.split(leadingTrailingSpace); // splits the string by newline characters
    lines = lines.map(line => line.trim()); // trims each line of whitespace
    str = lines.join("\n"); // joins the lines back with newline characters

    let blankLine = /\n+/g; // matches one or more newline characters
    let commentLine = /^(#|\/\/).*/gm; // matches lines that start with # or //
    let singleLineComment = /(?<!['"])(#|\/\/)(?![^'"\n]*['"])[^\n]*/g; // matches # or // followed by anything except a newline, unless inside quotes
    let multiLineComment = /(?<!['"])\/\*[\s\S]*?\*\//g; // matches /* followed by anything until */, unless inside quotes
    let docstring = /(?<!['"])("""|''')[\s\S]*?\1/g; // matches """ or ''' followed by anything until the same quote, unless inside quotes
    
    // Replace each type of comment or whitespace with an empty string
    
    str = str.replace(commentLine, "");
    str = str.replace(singleLineComment, "");
    str = str.replace(multiLineComment, "");
    str = str.replace(docstring, "");
    str = str.replace(blankLine, "\n"); 

    // Set the value of the editor to the modified string
    editor1.setValue(str);
}

function debugPrompt() {
    pyaiPrompt("debug");
}
        
function codePrompt() {
    pyaiPrompt("code");
}
        
function pyaiPrompt(pyaiType) {
    let code = editor1.getSelection();
    if (code === '') {
        code = editor1.getValue();
        code = code.replace(/\+/g, "@PLUS@#@SIGN@");
        code = code.replace(/\&/g, "@AMPER@#@SIGN@");
    }
    let context = contextBox.value;
    editor2.setValue('Generating...');
    editor2.setOption('readOnly', true);

    // Send a POST request to the /save_files route
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/save_files');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(encodeURI('code=' + code + '&context=' + context + '&pyaiType=' + pyaiType));

	// Poll the /get_line route for new data at regular intervals
	// Use a variable to store the start time of polling
	let startTime = Date.now();
	let intervalId = setInterval(function() {
	    // Use another variable to store the current time
	    let currentTime = Date.now();
	    // Check if 8 seconds have passed since the start time
	    if (currentTime - startTime >= 8000) {
		let xhr2 = new XMLHttpRequest();
		xhr2.open('GET', '/get_line');
		xhr2.onload = function() {
		    if (xhr2.status === 200) {
		        let vmoutput = xhr2.responseText;
		        // Check if vmoutput is "END" or has length 1 or less after 60 seconds
		        if (vmoutput === "END" || (currentTime - startTime >= 60000 && vmoutput.length <= 1)) {
		            // Stop polling if we receive the "END" message or timeout
		            clearInterval(intervalId);
		        } else {
		            // Update the value of editor2 with the vmoutput and re-enable it
		            editor2.setOption('readOnly', false);
		            editor2.setValue(vmoutput);
		            // Set the cursor position at the end of editor2 using setCursor method
		            editor2.setCursor(editor2.lineCount(), 0);
		        }
		    }
		};
		xhr2.send();
	    }
	}, 100);
}

let draggableWidth = parseFloat(draggable.style.width);

draggable.style.top = containerHeight + 3 + 'px';

let isDragging = false;

handle.addEventListener("mousedown", (e) => {
    isDragging = true;
});

document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    let containerWidth = container.offsetWidth;
    let newDraggableWidth = (containerWidth - e.clientX) / containerWidth * 100;

    draggable.style.width = `${newDraggableWidth}%`;
});

document.addEventListener("mouseup", (e) => {
    isDragging = false;
        draggableWidth = parseFloat(draggable.style.width);
    if (draggableWidth < 1) {
        draggable.style.width = "0%";
    }
});

handle.addEventListener("dblclick", () => {
    if (draggable.style.width <= "2%") {
        draggable.style.width = "80%";
        adjustInsideDraggable();
        
    } else {
        draggable.style.width = "0%";
        adjustInsideDraggable();
    }
});

const draggableb = handle.parentElement;

const toggleWidth = () => {
    if (parseFloat(draggableb.style.width) <= 2) {
        draggableb.style.width = "80%";
        adjustInsideDraggable();
    } else {
        draggableb.style.width = "0%";
        adjustInsideDraggable();
    }
};

handle.addEventListener("dblclick", toggleWidth);
draggableb.addEventListener("dblclick", toggleWidth);

// Add an event listener for when the user starts dragging the bottom splitter
handle.addEventListener('mousedown', function() {
    bottomSplitterDragging = false;
    topSplitterDragging = false;
    codeBoxWrapper.style.pointerEvents = 'none';
    outputBoxWrapper.style.pointerEvents = 'none';
    codeBoxWrapper.style.userSelect = 'none';
    outputBoxWrapper.style.userSelect = 'none';
    contextBox.style.userSelect = 'none';
});

let insideDraggable = document.getElementById("inside_draggable");

function adjustInsideDraggable() {

    insideDraggable.style.width = draggable.offsetWidth + "px";
    var children = insideDraggable.children;
    for (var i = 0; i < children.length; i++) {
        children[i].style.width = "90%";
    }
}
var resizeObserver = new ResizeObserver(function(entries) {
    adjustInsideDraggable();
});
resizeObserver.observe(draggable);
