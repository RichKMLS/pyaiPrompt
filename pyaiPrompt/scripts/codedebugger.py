#!/user/bin/env python3
# -*- coding: us-ascii -*-

"""
This program is designed to help debug Python scripts by replacing user input calls with randomly
generated values and updating file paths to work within a virtual machine without user interaction.
It takes in a file path as a command line argument and modifies the code within a new file. The
program then runs the modified script with debugging tools and checks if it ran successfully. The
result of running the script is written to a file, which can be an error message or the string "PASS".
The program also includes functions to monitor memory usage, restore the original version of the script,
and check for imports. Data collected from running the script as a subprocess is formatted and sent to
an AI, which creates a new version of the code using error logs and other data. This process is repeated
until the script passes or a maximum number of debug iterations have passed. The user is then notified
of the new code.
"""

import re
import random
import subprocess
import argparse
import os
import threading
import psutil
import shutil
import time
import pkgutil
import sys
import tracemalloc
from radon.complexity import cc_visit


def codePassed(file_path):
    """
    This function restores the original version of a script that was modified for debugging purposes.
    It removes the lines that replaced user input with random values and the mock file references.
    It removes the comment ID from the original lines. The function takes in a file path as an
    argument and reads its contents. It then writes the restored version of the code to the original file.

    :param file_path: The path to the file containing the code to be restored.
    :type file_path: str
    """
    with open(file_path, 'r') as f:
        lines = f.readlines()
    with open(file_path, 'w') as f:
        skip_next = False
        for line in lines:
            if skip_next:
                skip_next = False
                continue
            if "#%@ " in line:
                skip_next = True
                line = line.replace("#%@ ", "")
            f.write(line)


def monitor_memory(process: subprocess.Popen, memory_threshold: float):
    """
    This function monitors the memory usage of a subprocess and terminates it if it exceeds a
    specified memory threshold. The function takes in a subprocess.Popen object and a memory
    threshold as arguments. It uses psutil to monitor the memory usage of the subprocess and
    terminates it if the memory usage exceeds the threshold.

    :param process: The subprocess to be monitored.
    :type process: subprocess.Popen
    :param memory_threshold: The memory threshold in MB.
    :type memory_threshold: float
    """
    # Get the process ID of the subprocess
    try:
        pid = process.pid
	    
        # Check if the process ID exists
        if psutil.pid_exists(pid):
            # Create a psutil process object for the subprocess
            p = psutil.Process(pid)
		
            # Continuously monitor the memory usage of the subprocess
            while True:
                # Check if the subprocess is still running
                if not process.poll():
                    # Get the current memory usage of the subprocess
                    memory_info = p.memory_info()
                    memory_usage = memory_info.rss / 1024 / 1024
		        
                    # Check if the memory usage exceeds the threshold
                    if memory_usage > memory_threshold:
                        # Terminate the subprocess
                        process.terminate()
                        break
		    
                # Sleep for a short time before checking again
                time.sleep(0.1)
    except:
    
        print("no process ID found")

     
def pydebug(script_name: str) -> str:
    """
    This function takes in a script name as an argument and runs it with debugging tools. It handles
    issues such as syntax errors, infinite loops, memory leaks, and output messages. The function
    returns the result of running the script as a string. It uses tracemalloc to monitor memory usage
    and subprocess to run the script. If any issues are encountered, they are added to the result.

    :param script_name: The name of the script to be debugged.
    :type script_name: str
    :return: The result of running the script with debugging tools.
    :rtype: str
    """
    
    result = ""
    try:
        # Start tracing memory allocations
        tracemalloc.start()
        
        # Get script size in bytes
        script_size = os.path.getsize(script_name)
        
        # Read script contents
        with open(script_name, 'r') as f:
            script_contents = f.read()
        
        # Calculate average cyclomatic complexity if possible
        cc = cc_visit(script_contents)
        if cc:
            avg_cc = sum(x.complexity for x in cc) / len(cc)
            memory_threshold = max(script_size / 1024 / 1024 * 10.0, avg_cc * 10.0)
        else:
            memory_threshold = script_size / 1024 / 1024 * 100
        
        # Set new memory threshold to the maximum of the calculated threshold and 1.0 GB
        new_memory_threshold = max(memory_threshold, 1024.0)
        
        # Run the script with tracemalloc enabled
        process = subprocess.Popen(["python", "-X", "tracemalloc", script_name], 
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        # Set memory threshold if process still exists
        if process.poll():
            monitor_thread = threading.Thread(target=monitor_memory, args=(process, memory_threshold))
            monitor_thread.daemon = True
            monitor_thread.start()
        
        try:
            # Wait for the script to finish executing
            stdout, stderr = process.communicate(timeout=10)
            
            # Check if the script executed successfully
            if process.returncode == 0:
                result = "PASS"
            else:
                result += f"{stderr}"
            
            # Check memory usage
            current, peak = tracemalloc.get_traced_memory()
            if peak / 1024 / 1024 > memory_threshold * 0.9:
                result += f"\n\nCurrent memory usage: {current / 1024 / 1024}MB; Peak: {peak / 1024 / 1024}MB"
                snapshot = tracemalloc.take_snapshot()
                top_stats = snapshot.statistics('lineno')
                result += "\n\nTop 10 memory usage:"
                for stat in top_stats[:10]:
                    result += f"\n{stat}"
        
        except subprocess.TimeoutExpired:
            # Handle script timeout
            result = "TIMEOUT"
            process.terminate()
    
    except Exception as e:
        # Handle debugging errors
        result += f"DEBUGGING ERROR:\n{e}"
    
    finally:
        # Stop tracing memory allocations
        tracemalloc.stop()
    
    return result


def generate_random_value(var_type):
    """Generate a random value based on the variable type."""
    if var_type == 'int':
        return random.randint(0, 100)
    elif var_type == 'float':
        return round(random.uniform(0, 100), 2)
    elif var_type == 'str':
        return f'"{"".join(random.choices("abcdefghijklmnopqrstuvwxyz1234567890", k=5))}"'
    elif var_type == 'bool':
        return str(random.choice([True, False]))


def replace_input(file_path):
    """
    This function takes in a file path and modifies the code within the file by
    replacing user input calls with randomly generated values. The function reads
    the code from the file and uses regular expressions to find lines containing
    user input calls. These lines are then replaced with new lines that assign a
    randomly generated value to the variable that was previously assigned the user
    input value. The function also modifies lines containing required arguments in
    an ArgumentParser object by setting the 'required' parameter to False and adding
    a default value if one is not already present. The modified code is then returned.
    
    :param file_path: The path to the file containing the code to be modified.
    :type file_path: str
    :return: The modified code with user input calls replaced with randomly generated values.
    :rtype: str
    """
    
    modified = False
    # Read the code from the file
    with open(file_path, 'r') as f:
        code = f.read()
    # Find all lines containing input() calls
    input_lines = re.findall(r'^(.*input\(.+\).*)$', code, flags=re.MULTILINE)
    for line in input_lines:
        # Skip the function definition line
        if "def replace_input" in line:
            continue
        modified = True    	
        # Comment out the original line
        code = code.replace(line, f'#%@ {line}')
        # Extract the variable name and type
        var_name = line.split('=')[0].strip()
        var_type_match = re.match(r'.*?(\w+)\s*\(\s*input', line)
        if var_type_match:
            var_type = var_type_match.group(1)
        else:
            continue
            #var_type = 'null'
        # Generate a random value for this variable based on its type
        value = f'{generate_random_value(var_type)} #[SENSIBLE VALUE]'
        # Add a new line assigning the value to the variable
        new_line = f'{var_name} = {value}'
        code = code.replace(f'#%@ {line}', f'#%@ {line}\n{new_line}')
    
    # Find all lines containing parser.add_argument() calls with required=True
    parser_lines = re.findall(r'^(.*parser\.add_argument\(.+required\s*=\s*True.+\).*)$', code, flags=re.MULTILINE)
    for line in parser_lines:
        modified = True    	
        # Comment out the original line
        code = code.replace(line, f'#%@ {line}')
        # Replace required=True with required=False
        new_line = line.replace('required=True', 'required=False')
        # Check if the argument has a default value
        if 'default=' not in line:
            # Add the default value to the argument
            new_line = new_line.replace(')', ', default="[SENSIBLE VALUE]")')
        # Add the new line to the code
        code = code.replace(f'#%@ {line}', f'#%@ {line}\n{new_line}')
    
    return code


def update_more_files(filepath):
    """
    This function takes in a file path and modifies the code within the file by
    updating file paths. The function reads the code from the file line by line
    and checks for lines containing file paths. These lines are then commented out
    and new lines are added that contain the updated file paths. If a file does not
    exist, it is created with a placeholder value. The modified code is then saved
    to the original file.

    :param filepath: The path to the file containing the code to be modified.
    :type filepath: str
    """
    
    # Open the file in read mode
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    # Open the file in write mode
    with open(filepath, 'w') as f:
        # Iterate over each line in the file
        for line in lines:
            # Check if line is a comment or contains specific strings
            if line.strip().startswith('#') or '/home/user/sig/' in line or '[SENSIBLE VALUE]' in line:
                f.write(line)
            # Check if line contains an open function with a comma
            elif 'open(' in line and ',' in line:
                # Comment out the original line
                f.write(f'#%@ {line}')
                start = line.find('open(') + 5
                end = line.find(',', start)
                filename = line[start:end].strip("'\"")
                # Check if filename starts with a forward slash
                if filename.startswith('/'):
                    filename = os.path.basename(filename)
                new_line = line[:start] + f"'/home/user/sig/{filename}'" + line[end:]
                f.write(new_line)
                mock_file_path = os.path.join('/home/user/sig/', filename)
                # Create a mock file with a placeholder value
                with open(mock_file_path, 'w') as mock_file:
                    mock_file.write('[SENSIBLE VALUE]')
            else:
                f.write(line)


def replace_file_paths(file_path):
    """
    This function modifies the code in a given file by replacing the file paths with updated ones.
    It reads the code from the file and uses regular expressions to identify lines that contain file paths.
    It comments out those lines and adds new lines with updated mock file paths.
    It creates the mock files in the new mock paths
    It returns the modified code as a string.

    :param file_path: The path to the file containing the code to be modified.
    :type file_path: str
    :return: The modified code with updated file paths.
    :rtype: str
    """
    
    # Open the file in read mode
    with open(file_path, 'r') as f: # tester
        code = f.read()
    
    # Use regular expressions to find lines containing file paths
    file_lines = re.findall(r'^(.*?(?:\w+\s+)?open\(["\'])(/[\w./-]+)(["\'].*\))$', code, flags=re.MULTILINE)
    file_lines += re.findall(r'^(.*?=\s*["\'])(/[\w./-]+)(["\'].*)$', code, flags=re.MULTILINE)
    
    # Iterate over each line containing a file path
    for line in file_lines:
        old_line = "".join(line)
        # Check if line is a comment or contains specific strings
        if old_line.startswith('#') or '/home/user/sig/' in old_line or '[SENSIBLE VALUE]' in old_line:
            continue
        # Comment out the original line
        commented_line = f'#%@ {old_line}'
        code = code.replace(old_line, commented_line)
        file_path = line[1]
        new_file_path = "/home/user/sig/" + os.path.basename(file_path)
        # Check if original file exists
        if os.path.exists(file_path):
            shutil.move(file_path, new_file_path)
        else:
            # Check if new path is a file or directory
            if "." in new_file_path:
                # Create a mock file with a placeholder value
                with open(new_file_path, 'w') as f:
                    f.write("[SENSIBLE VALUE]")
            else:
                os.mkdir(new_file_path)
        # Add a new line with updated mock file path
        new_line = f'\n{line[0]+new_file_path+line[2]}'
        index = code.index(commented_line) + len(commented_line)
        code = code[:index] + new_line + code[index:]
    
    return code


def check_imports(file_path: str) -> None:
    """
    This function reads a Python file and extracts the import statements. It checks if the imported
    packages are already installed or if they are built-in libraries. If either of these conditions
    is true, the import statement is not included in the list. The resulting list of imports is then
    written to a file called 'imports.txt'. The function takes in a file path as an argument and
    returns None.

    :param file_path: The path to the Python file to check.
    :type file_path: str
    :return: None
    """
    
    # Open the file in read mode
    with open(file_path, 'r') as file:
        lines = file.readlines()
        imports = []
        # Iterate over each line in the file
        for line in lines:
            # Check if line is an import statement
            if line.startswith('import') or line.startswith('from'):
                package = line.split()[1]
                # Check if package name contains a dot
                if '.' in package:
                    package = package.split('.')[0]
                # Check if package is already installed or is a built-in library
                if not pkgutil.find_loader(package) and package not in sys.builtin_module_names:
                    imports.append(line.strip())
    
    # Write the list of imports to a file
    with open('imports.txt', 'w') as file:
        file.write(', '.join(imports))


def main():
    """
    This function parses the command line arguments and runs the pydebug function. It checks if the
    script ran successfully and writes its output or error message to a file accordingly. The function
    sets up an argument parser to take in the path to the Python script to debug. It then calls other
    functions to modify the code and run it with debugging tools. The result is then written to a file.

    :return: None
    """
    
    # Set up argument parser
    parser = argparse.ArgumentParser(
        prog="pyDebbuger.py",
        description="Debug a python script by replacing user input calls with randomly generated values."
    )
    parser.add_argument("--input", type=str, required=True, help="Path to the python script to debug")
    args = parser.parse_args()
    
    parser.add_argument("--context", type=str, required=False, default=False, help="Path to the context to help AI debug")
    args = parser.parse_args()
    
    parser.add_argument("--AIONLY", type=bool, required=False, default=False,  help="Set to True to skip internal debugging")
    args = parser.parse_args()
    
    # Get the list of inports from the input file and create a list
    check_imports(args.input)
    thecode = replace_file_paths(args.input)
    # Get the directory of the input file    
    input_dir = os.path.dirname(args.input)

    new_script_path = os.path.join(input_dir, 'new_script.py')
    with open(new_script_path, 'w') as f:
        f.write(thecode)	

    # Replace user input calls in the code with randomly generated values
    new_code = replace_input(new_script_path)

    # Write the modified code to a new file
    new_script_path = os.path.join(input_dir, 'new_script.py')
    with open(new_script_path, 'w') as f:
        f.write(new_code)
    
    update_more_files(new_script_path)
    
    # Run the modified script and store its result
    result = pydebug(new_script_path)

    # Write the script output or error message to a file
    output_path = os.path.join(input_dir, "codetest.txt")
    with open(output_path, "w") as f:
        if result == "PASS":
            f.write("PASS\n")
            #codePassed(new_script_path)
        else:
            lines = result.split('\n')
            stripped_lines = [line.lstrip() for line in lines]
            errorMsg = 'Error:\n```\n' + '\n'.join(stripped_lines) + '\n```'
            f.write(errorMsg)
  

if __name__ == "__main__":
    main()
