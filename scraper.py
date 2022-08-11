import requests
import re
import json
# Easton Singer
# Mr. McKeen's APCS class
# Solondle assignment --
#NO CODE SMELLS ALLOWED!!!!!!!!!!!!!!!

# Scrape Website 
# x = requests.get('https://www.naqt.com/stats/school/players.jsp?org_id=1277')
# with open('solonStats.txt', 'w') as f:
#     f.write(x.text)

# Open result file
with open('solonStats.txt', 'r') as f:
    lines = f.readlines()

# Find what the line the stat table starts
for i in range(len(lines)):
    if '<tbody>' in lines[i]:
        startTable = i+1
        break

# Synthesis 
count = startTable
# numPeople = 0
createJSON = {}
# powers = []
# tens = []
# negs = []
while '<th>' in lines[count]: # Name | Year | T | GP | TUH | Pts | 15s | 10s | -5s | P% | PP20TH
    parsedLine = []
    nameLine = lines[count].strip() 
    yearLine = lines[count+1].strip()
    name = nameLine.split('>')[2].split('<')[0]
    NAQTid = nameLine.split('id=')[1].split('"')[0]
    parsedLine.append(name)
    startYear = int(yearLine.split('>')[1].split('<')[0][:4])
    parsedLine.append(startYear)
    endYear = int(yearLine.split('>')[1].split('<')[0][-4:])
    parsedLine.append(endYear)
    for i in range(2, 11):
        stat = lines[count+i].strip().split('>')[1].split('<')[0]
        if i < 9:
            stat = int(stat)
        parsedLine.append(stat)
    if (endYear >= 2015 and parsedLine[3] >= 5) or (startYear >= 2020 and parsedLine[3] >= 2): 
        # numPeople += 1
        # with open('delete.txt', 'a') as f:
        #     f.write(f'{parsedLine[0]}: {parsedLine[1]}-{parsedLine[2]} | {parsedLine[3]} tournaments\n')
        print(f'{parsedLine[0]}: {parsedLine[1]}-{parsedLine[2]} | {parsedLine[3]} tournaments')
        # personDict = {'name': name,
        #               'start_year': startYear, 
        #               'end_year': endYear, 
        #               'tournaments_played': parsedLine[3], 
        #               'games_played': parsedLine[4],
        #               'tossups_heard': parsedLine[5],
        #               'points': parsedLine[6],
        #               'powers': parsedLine[7],
        #               'tens': parsedLine[8],
        #               'negs': parsedLine[9],
        #               'power_pct': parsedLine[10],
        #               'pp20th': parsedLine[11],
        #               'id': NAQTid}
        # createJSON.append(personDict)
        # with open('data.json', 'w') as f:
        #     json.dump(createJSON, f, ensure_ascii=False, indent=4)
        createJSON[name] = {
                      'start_year': startYear, 
                      'end_year': endYear, 
                      'tournaments_played': parsedLine[3], 
                      'games_played': parsedLine[4],
                      'tossups_heard': parsedLine[5],
                      'points': parsedLine[6],
                      'powers': parsedLine[7],
                      'tens': parsedLine[8],
                      'negs': parsedLine[9],
                      'power_pct': parsedLine[10],
                      'pp20th': float(parsedLine[11]),
                      'id': NAQTid}
        with open('nameData.json', 'w') as f:
            json.dump(createJSON, f, ensure_ascii=False, indent=4)
        # powers.append(parsedLine[7])
        # tens.append(parsedLine[8])
        # negs.append(parsedLine[9])
    count += 11

# powers.sort()
# tens.sort()
# negs.sort()
# with open('powers.json', 'w') as f:
#     json.dump(powers, f, ensure_ascii=False, indent=4)
# with open('tens.json', 'w') as f:
#     json.dump(tens, f, ensure_ascii=False, indent=4)
# with open('negs.json', 'w') as f:
#     json.dump(negs, f, ensure_ascii=False, indent=4)
# print(numPeople)

"""
NAME    YEAR?    TOURNAMENTS PLAYED     POWERS      NEGS      PPG
"""