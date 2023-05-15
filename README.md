# pyaiPrompt
A python IDE designed for the new programming workflow.

An automatic prompt engineering focused backend debugs, cleans, and formats your code.

<p align="center">
  <img src="https://github.com/RichKMLS/pyaiPrompt/assets/105183376/7479dd61-73e3-44bb-886b-bf2bab4ccd46"/>
  <br>
</p>

# --- work in progress ---


## A Responsive UI for the New Programming Workflow

The web application consists of three main components: a code editor, a context box, and an output box. The code editor is where the user can write their code in any language they prefer. The context box is where the user can specify their problem or the functionality they want their code to achieve. The user can select particular snippets of the code and then click the Prompt/Debug button which will send a prompt formatted message to the AI requesting help. The output box is where the user will see the new code generated by the AI, along with professional comments that explain the new code.

It uses a responsive UI that allows the user to resize and expand the three boxes according to their preference. The user can drag the splitters between the boxes to adjust their height, or double click on any box to make it fill the screen. The code editor and the output box are both powered by CodeMirror, a versatile text editor that supports syntax highlighting, auto-completion, and line wrapping.

It currently is leveraging Bing AI to generate outputs. pyaiPrompt then formats the text sent from Bing AI so that only the relevant code will appear in the output.
