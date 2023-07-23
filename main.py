import json
import openai
import threading
import itertools
import time
import sys
import json
import subprocess 


done = False
#here is the animation
def animate():
    for c in itertools.cycle(['|', '/', '-', '\\']):
        if done:
            break
        sys.stdout.write('\rloading ' + c)
        sys.stdout.flush()
        time.sleep(0.1)
    
    
filepath = 'data.json'
with open(filepath, 'r') as fp:
    data = json.load(fp)

openai.api_key = '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'
messages = [ {"role": "system", "content": 
              "You are a intelligent assistant."} ]

message = "Write me " + input("How many questions? ") + " multiple choices about " + input("Enter Topic Here: ") + " in this format: {\"response_code\":0,\"results\":[{\"category\":\"Geography\",\"type\":\"multiple\",\"difficulty\":\"easy\",\"question\":\"WhatisthenameofthepeninsulacontainingSpainandPortugal?\",\"correct_answer\":\"IberianPeninsula\",\"incorrect_answers\":[\"EuropeanPeninsula\",\"PeloponnesianPeninsula\",\"ScandinavianPeninsula\"]}]}";
if message:
    messages.append(
        {"role": "user", "content": message},
    )
    t = threading.Thread(target=animate)
    t.start()
    chat = openai.ChatCompletion.create(
        model="gpt-3.5-turbo", messages=messages
    )
    done = True
    
print("Questions Generated!")
print("\n")
reply = chat.choices[0].message.content

messages.append({"role": "assistant", "content": reply})
data = json.loads(reply)
subprocess.run("pbcopy", text=True, input=reply)

with open(filepath, 'w') as fp:
    json.dump(data, fp)