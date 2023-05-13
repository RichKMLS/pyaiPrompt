"""
This script creates an XMLRPC server that can run a pyaiprompt script on a VM and return the output.
The script also provides a function to shutdown the VM remotely.

The script is started automatically via bashrc when the VM boots up.

The script uses the following files and directories:

pyaiDir: The directory where the pyaiprompt script and its input and output files are stored.
pyai: The path to the pyaiprompt script.
codefile: The path to the file where the code input for the pyaiprompt script is written.
contextfile: The path to the file where the context input for the pyaiprompt script is written.
outputfile: The path to the file where the output of the pyaiprompt script is read.

The script exposes two functions via XMLRPC:

shutdown_vm(): Shuts down the VM using the os.system command.
prompt_ai(code, context): Runs the pyaiprompt script with the given code and context inputs and returns the output as a string.
"""

import os
import subprocess
import sys
from xmlrpc.server import SimpleXMLRPCServer

# Define the paths for the pyaiprompt script and its input and output files
pyaiDir = "/home/signal/pyaiprompt"
pyai = pyaiDir + "/pyaiprompt.py" # Added a "+" operator to concatenate strings
codefile = pyaiDir + "/code.txt"
contextfile = pyaiDir + "/context.txt"
outputfile = pyaiDir + "/output.txt"

print("Starting XMLRPC Server.")

def shutdown_vm():
    """Shuts down the VM using the os.system command."""
    os.system('shutdown now -h')
    return 'Shutting down VM'

def prompt_ai(code, context):
    """Runs the pyaiprompt script with the given code and context inputs and returns the output as a string."""
    print(code + "
") # Added a "+" operator to concatenate strings
    print(context + "
") # Added a "+" operator to concatenate strings
    # Create the directory for the pyaiprompt script and its input and output files if it does not exist
    if not os.path.exists(pyaiDir):
        os.mkdir(pyaiDir) # Fixed a typo from os.makedir to os.mkdir
    # Write the code and context inputs to their respective files
    with open (codefile, "w") as f:
        f.write(code)
    with open (contextfile, "w") as f:
        f.write(context)
    # Run the pyaiprompt script using subprocess.run and wait for it to finish
    process = subprocess.run([sys.executable, pyai]) # Fixed a syntax error from subprocess.Popen to subprocess.run
    # Read the output from the output file and return it as a string
    with open(outputfile, "r") as f:
        output = f.read()
    print(output)
    return output

# Create an XMLRPC server object with a specific IP address and port number
server = SimpleXMLRPCServer(('192.168.56.101', 8000))
# Register the shutdown_vm and prompt_ai functions as XMLRPC methods
server.register_function(shutdown_vm, 'shutdown_vm')
server.register_function(prompt_ai, 'prompt_ai')
# Start serving requests until interrupted
server.serve_forever()
print("xmlrpc started!")
