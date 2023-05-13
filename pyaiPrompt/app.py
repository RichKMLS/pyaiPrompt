"""
This module contains a Flask app that communicates with a virtual machine via XML-RPC
and performs an action based on the user input from a the pyaiPrompt web app.

Dependencies:
- re: for regular expressions
- os: for operating system commands
- subprocess: for running external commands
- xmlrpc.client: for XML-RPC communication
- socket: for socket operations
- flask: for web application framework
"""

import os
import re
import socket
import subprocess
import xmlrpc.client

from flask import Flask, request, render_template


# Set default timeout for socket operations in seconds
SOCKET_TIMEOUT = 120

# Name of the virtual machine
VM_NAME = 'pyaiPrompt'

# Create the app object
app = Flask(__name__)

# Define the routes and functions for the app
@app.route('/save_files', methods=['POST'])
def save_files():
    """Get text data from two textboxes from a webapp and perform an action in a 
    virtual machine, then return the output back into the third textbox on the webapp.

    Args:
        code (str): The code from the first textbox
        context (str): The context from the second textbox
        pyaiType (str): The type of pyai operation (code or debug)

    Returns:
        str: The output of the pyai operation or an error message
    """
     # Get the code from the first textbox
    code = request.form['code']
    # Replace @PLUS@#@SIGN@ with + in the code
    code = code.replace("@PLUS@#@SIGN@", "+")
    
    # Get the context from the second textbox
    context = request.form['context']

    # Get the pyaiType from the form
    pyaiType = request.form['pyaiType']

    # Try to call the prompt_ai method on the proxy with code and context as arguments
    try:
        if pyaiType == "code":
            # Strip any leading or trailing whitespace from the whole string
            code = code.strip()
            context = context.strip()
            # Call prompt_ai on the proxy
            vmoutput = proxy.prompt_ai(code, context)
        else:
            # Call debug_code on the proxy
            vmoutput = proxy.debug_code(code, context)
        
        # Split the output by codeblock indicators
        parts = vmoutput.split('```')
        
        # If there are at least two parts, get the output between the codeblock
        if len(parts) >= 2:
            vmoutput = parts[1].strip()
        
        # The new regex pattern that matches AI followed by zero or more characters followed by (as suggested|as per) and everything after that
        pattern = r"AI.*?(as suggested|as per).*$"
        
        # The re.sub function replaces the matched pattern with an empty string, effectively deleting it
        vmoutput = re.sub(pattern, "", vmoutput, flags=re.MULTILINE | re.DOTALL)
        
        # Remove AI_1 comment indicators
        vmoutput = vmoutput.replace('AI_1: ', '')
        
        # Define regex to remove extra text that sometimes comes after the codeblock syntax
        regex = re.compile(r'^\s*(?:python|py)\s*\n?', re.IGNORECASE)
        
        # Use the regular expression to remove the first line if it matches
        vmoutput = regex.sub('', vmoutput)
    
    # If there is a timeout exception, set vmoutput to a timeout message
    except socket.timeout:
        vmoutput = "Message timed out, try using a shorter prompt or code snippet!"
    
    # If there is any other exception, set vmoutput to a generic error message
    except Exception as e:
        vmoutput = f"Sorry, something went wrong! :( Error: {e}"
    
    # If vmoutput is None or arbitrarily too short, set it to a sorry message
    if not vmoutput or len(vmoutput) < 7:
        vmoutput = "Sorry, something went wrong! :("
    
    # Return the output
    return vmoutput


@app.route('/')
def index():
    """Render the index.html template for the webapp.

    Returns:
        str: The rendered template.
    """
    return render_template('index.html')


def start_vm():
    """Start the vm in headless mode using VBoxManage command."""
    # Run the VBoxManage command with the vm name and headless type as arguments
    subprocess.run(['VBoxManage', 'startvm', VM_NAME, '--type', 'headless'])


def main():
    """Run the Flask app."""
    # Start the vm
    start_vm()
    app.run()


proxy = xmlrpc.client.ServerProxy('http://127.0.0.1:8000/')
  
if __name__ == '__main__':
    # Run the app
    main()
