import json
import requests
import webbrowser


sample = open('sample.txt', 'r')
url = "https://www.reddit.com/r/imaginarylandscapes.json"
chrome_path = 'open -a /Applications/Google\ Chrome.app %s'

r = requests.get(url, headers = {'User-agent': 'img_puller'})
a = sample.read()

j = json.loads(r.text)
webbrowser.get(chrome_path).open(j['data']['children'][2]['data']['url'])
