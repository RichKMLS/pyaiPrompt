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

import time
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

# Global variable to store the current value of line
output_string = ""

@app.route("/get_line")
def get_line():
    global output_string
    print(output_string)
    return output_string

    
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
    
    global output_string
    output_string = ""
    
    # Get the code from the first textbox
    code = request.form['code']
    # Replace @PLUS@#@SIGN@ with + in the code
    code = code.replace("@PLUS@#@SIGN@", "+")
    code = code.replace("@AMPER@#@SIGN@", "&")
    
    # Get the context from the second textbox
    context = request.form['context']

    # Get the pyaiType from the form
    pyaiType = request.form['pyaiType']

    # Try to call the prompt_ai method on the proxy with code and context as arguments
    try:
        # Check if the input type is code
        if pyaiType == "code":
            # Remove any leading or trailing whitespace from the code and context
            code = code.strip()
            context = context.strip()
            # Send the code and context to the proxy AI
            proxy.prompt_ai(code, context)
            # Wait for 9 seconds for the AI to process the input
            time.sleep(9)
            # Initialize variables to track the output length and changes
            prev_length = 0
            count = 0
            # Loop until there is no change in the output for 16 iterations
            while True:
                # Get the current output from the proxy AI
                new_output = proxy.getOutput()
                # Check if the output length is the same as before and not empty
                if len(new_output) == prev_length and len(new_output) > 1:
                    # Increment the count of unchanged iterations
                    count += 1
                    # If the count reaches 16, print "no change" and break the loop
                    if count == 16:
                        print("no change")
                        time.sleep(0.20)
                        break
                else:
                    # Reset the count to zero if there is a change in the output length
                    count = 0
                # Update the previous output length to the current one
                prev_length = len(new_output)
                # Initialize an empty string to store the pre-processed output
                pre_output_string = ""
                # Initialize a flag to indicate whether to skip a line or not
                flag = False
                # Split the output into lines and remove any lines that match a URL pattern
                lines = [line + "\n" for line in new_output.splitlines() if not re.match(r'\[\d+\]: https://', line)]
                # Loop through each line in the output
                for line in lines:
                    # If the line contains 'xxx' and the flag is False, set the flag to True and skip the line
                    if '```' in line and not flag:
                        flag = True
                        continue
                    # If the flag is True, append the line to the pre-processed output string
                    elif flag:
                        pre_output_string += line
                    # Otherwise, do nothing
                    else:
                        pass
                # Check if '```' is still in the pre-processed output string
                if '```' in pre_output_string:
                    # Remove everything after 'xxx' from the pre-processed output string
                    output_string = re.sub(r'```.*$', '', pre_output_string)
                    # Wait for 1.5 seconds before returning the final output string
                    time.sleep(1.5)
                    output_string  = "END"
                    return output_string 
                else:
                    # Set the output string to be the same as the pre-processed output string
                    output_string = pre_output_string
                    # Wait for 0.20 seconds before printing the output string
                    time.sleep(0.20)
                    print(output_string)
            
            output_string  = "END"
      
        else:
            # Call debug_code on the proxy
            vmoutput = proxy.debug_code(code, context)
        
        # Split the output by codeblock indicators
        parts = vmoutput.split('```')
        
        # If there are at least two parts, get the output between the codeblock
        if len(parts) >= 2:
        
            vmoutput = parts[1].strip()
        
        # The new regex pattern that matches AI followed by zero or more characters followed by (as suggested|as per) and everything after that
        #pattern = r"AI.*?(as suggested|as per).*$"
        
        # The re.sub function replaces the matched pattern with an empty string, effectively deleting it
        #vmoutput = re.sub(pattern, "", vmoutput, flags=re.MULTILINE | re.DOTALL)
        
        # Remove AI_1 comment indicators
        #vmoutput = vmoutput.replace('AI_1: ', '')
        
        # Define regex to remove extra text that sometimes comes after the codeblock syntax
        regex = re.compile(r'^\s*(?:python|py)\s*\n?', re.IGNORECASE)
        
        # Use the regular expression to remove the first line if it matches
        vmoutput = regex.sub('', vmoutput)
    
    # If there is a timeout exception, set vmoutput to a timeout message
    except socket.timeout:
        vmoutput = "Message timed out, try using a shorter prompt or code snippet!"
    
    # If there is any other exception, set vmoutput to a generic error message
    #except Exception as e:
    #    vmoutput = f"Sorry, something went wrong! :( Error: {e}"
    
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


proxy = xmlrpc.client.ServerProxy('http://127.0.0.1:8000/', allow_none=True)
  
if __name__ == '__main__':
    # Run the app
    main()
    
    
    

