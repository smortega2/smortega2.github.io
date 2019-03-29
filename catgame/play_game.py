import os
from flask import Flask
from flask import render_template
from flask import request, redirect
import random
import string

app = Flask(__name__)

email_addresses = []

@app.route('/')
def hello_world():
    return render_template('index.html')

@app.route("/start", methods=['POST'])
def setup_game():
    print('setting up game...')
    letter = generate_letter()
    category_list = generate_categories()
    return render_template('game.html', letter = letter, categories = category_list)

def generate_letter():
	letters = set(string.ascii_uppercase) - set(['Q','U','V','X','Y','Z'])
	return random.choice(list(letters))

def generate_categories():
	categories = [	"things you don't want in the house",
					"colors",
					"things you laernred as a kid",
					"seen at a concert",
					"people you admire",
					"on a menu",
					"found at the beach",
					"comes in pairs or sets",
					"things at a birthday party",
					"nicknames",
					"in a freezer",
					"things that need to be cleaned",
					"boy's names",
					"foods you eat for breakfast",
					"an animal",
					"things that are cold",
					"insects",
					"tv shows",
					"things that grow",
					"fruits",
					"things that are black",
					"school subjects",
					"movie titles",
					"musical instruments",
					"authors",
					"bodies of water",
					"a bird",
					"countries",
					"cartoon characters",
					"holidays",
					"things that are square",
					"something that you would see in canada",
					"clothing",
					"a relative/ family member",
					"games",
					"famous athletes",
					"things that are green",
					"things you hate",
					"liquids",
					"microwavable things",
					"things that smell bad",
					"types of pain",
					"reasons to get divorced",
					"coastal cities",
					"famous last words",
					"things you lick",
					"tight places",
					"things you open",
					"big words (10+)",
					"jobs you don't want",
					"villains",
					"songs",
					"things kids stick up their nose",
					"things you do when no one is looking",
					"the 80's",
					"bad movies",
					"kinds of soup",
					"things found in new york",
					"spicy foods",
					"things you shouldn't touch",
					"things at a carnival",
					"places to hang out",
					"animal noises",
					"computer programs",
					"honeymoon spots",
					"things you buy for kids",
					"things that can kill you",
					"reasons to take out a loan",
					"words associated with winter",
					"things to do on a date",
					"historic events",
					"things you store items in",
					"things you do every day",
					"things you get in the mail",
					"things you save up to buy",
					"things you sit in/on",
					"reasons you make a phone call",
					"types of weather",
					"titles people can have",
					"things that have buttons",
					"items you take on a trip",
					"things that have wheels",
					"reasons to call 911",
					"things that make you smile",
					"ways to kill time",
					"things that can get you fired",
					"hobbies",
					"holiday activities",
					"movie stars",
					"heroes",
					"gifts/presents",
					"terms of endearment",
					"kinds of dances",
					"vehicles",
					"tropical locations",
					"sandwiches",
					"items in a catalog",
					"world leaders/ politicians",
					"school supplies",
					"excuses for being late",
					"ice cream flavors",
					"television stars",
					"things that jump",
					"articles of clothing",
					"desserts",
					"car parts",
					"things found on a map",
					"4-letter words",
					"items in a refrigerator",
					"street names",
					"things found in the ocean",
					"foods that kids hate",
					"things in a coffee bar",
					"things you mix up",
					"furniture",
					"presidents",
					"product names"
					]
	return random.sample(categories, 12)

@app.route('/signup', methods = ['POST'])
def signup():
    email = request.form['email']
    email_addresses.append(email)
    print(email_addresses)
    print('SIGNUP')
    return redirect('/')

@app.route('/emails.html')
def emails():
    return render_template('emails.html', email_addresses = email_addresses)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)