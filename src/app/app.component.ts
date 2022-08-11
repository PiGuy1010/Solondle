import { Component, OnInit, Output, ViewChild } from '@angular/core';
import {MatTable} from '@angular/material/table';
import { MatAutocomplete } from '@angular/material/autocomplete';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import qbData from '../data.json';
import nameData from '../nameData.json';
import powerData from '../powers.json';
import tenData from '../tens.json';
import negData from '../negs.json';
// import * as fs from 'fs';
declare var require: any;

export interface QBPlayer {
  name: string;
  end_year: number;
  tournaments_played: number;
  powers: number;
  tens: number;
  negs: number;
  ppg: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  myControl = new FormControl('');
  title = 'Solondle';
  names: string[] = [];
  filteredOptions!: Observable<string[]>;
  guessedRows: QBPlayer[] = [];
  displayedColumns: string[] = ['name', 'end_year', 'tournaments_played', 'powers', 'tens', 'negs', 'ppg'];
  correct: keyof typeof nameData = this.getDailyAnswer() as keyof typeof nameData
  id!: string;
  won = false;

  @ViewChild(MatTable) table!: MatTable<QBPlayer>;
  @ViewChild(MatAutocomplete) guess!: MatAutocomplete;

  ngOnInit() {
    let prevGuesses : string[] = [];
    if (localStorage.key(0) === null) {
      localStorage.setItem('guesses', '')
      let day = new Date()
      localStorage.setItem('day', day.toISOString().substring(0, 10))
    }
    else {
      let currentDay = new Date()
      if (localStorage.getItem('day') !== currentDay.toISOString().substring(0, 10)) {
        localStorage.setItem('guesses', '')
        localStorage.setItem('day', currentDay.toISOString().substring(0, 10))
      }
      else {
        prevGuesses = (localStorage.getItem('guesses') as string).split(',')
        if (prevGuesses[0] === '') {
          prevGuesses = []
        }
      }
    }
    for (var person of qbData) {
      if (prevGuesses.indexOf(person["name"]) !== -1) {
        continue
      }
      this.names.push(person["name"]);
    }
    for (var name of prevGuesses) {
      let row : QBPlayer = {name: name as keyof typeof nameData, 
        end_year: nameData[name as keyof typeof nameData]["end_year"],
        tournaments_played: nameData[name as keyof typeof nameData]["tournaments_played"],
        powers: nameData[name as keyof typeof nameData]["powers"],
        tens: nameData[name as keyof typeof nameData]["tens"],
        negs: nameData[name as keyof typeof nameData]["negs"],
        ppg: nameData[name as keyof typeof nameData]["pp20th"]
      }
      this.guessedRows.push(row)
      if (name === this.correct) {
        this.won = true
      }
    }
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.names.filter(option => option.toLowerCase().includes(filterValue));
  }

  OnNameSelected(selectedName : keyof typeof nameData) {
    let row : QBPlayer = {name: selectedName, 
                          end_year: nameData[selectedName]["end_year"],
                          tournaments_played: nameData[selectedName]["tournaments_played"],
                          powers: nameData[selectedName]["powers"],
                          tens: nameData[selectedName]["tens"],
                          negs: nameData[selectedName]["negs"],
                          ppg: nameData[selectedName]["pp20th"]
    }
    this.guessedRows.push(row)
    if (selectedName === this.correct) {
      this.won = true;
    }
    this.names.splice(this.names.indexOf(selectedName), 1)
    const input = document.getElementById('QBer') as HTMLInputElement | null;

    const value = input?.value;
    input!.value = '';
    this.myControl = new FormControl('');
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
    let prevGuesses = localStorage.getItem('guesses') as string
    if (prevGuesses === '') {
      localStorage.setItem('guesses', selectedName)
    }
    else {
      localStorage.setItem('guesses', prevGuesses + ',' + selectedName)
    }
    this.table.renderRows();
    // (document.getElementById("inputbox") as HTMLInputElement).value = ' ';
  }

  computeNameShading(guessName: string) {
    if (guessName === this.correct) {
      return {'background': 'green'}
    }
    return {}
  }

  computeYearShading(guessYear: number) {
    let correctYear = nameData[this.correct]["end_year"]
    if (guessYear === correctYear) {
      return {'background': 'green'}
    }
    if (guessYear-1 === correctYear || guessYear+1 === correctYear) {
      return {'background': '#D8BC09'}
    }
    return {}
  }

  computeTournamentShading(guessTP: number) {
    let correctTP = nameData[this.correct]["tournaments_played"]
    if (guessTP === correctTP) {
      return {'background': 'green'}
    }
    if (Math.abs(guessTP-correctTP) <= 2) {
      return {'background': '#D8BC09'}
    }
    return {}
  }

  computePowerShading(guessPowers: number) {
    let realRank1 = powerData.indexOf(nameData[this.correct]["powers"])
    let realRank2 = powerData.lastIndexOf(nameData[this.correct]["powers"])
    if (guessPowers === nameData[this.correct]["powers"]) {
      return {'background': 'green'}
    }
    if (powerData[Math.max(realRank1-3,0)] <= guessPowers && powerData[Math.min(realRank2+3,50)] >= guessPowers) {
      return {'background': '#D8BC09'}
    }
    return {}
  }

  computeTenShading(guessTens: number) {
    let realRank1 = tenData.indexOf(nameData[this.correct]["tens"])
    let realRank2 = tenData.lastIndexOf(nameData[this.correct]["tens"])
    if (guessTens === nameData[this.correct]["tens"]) {
      return {'background': 'green'}
    }
    if (tenData[Math.max(realRank1-3,0)] <= guessTens && tenData[Math.min(realRank2+3,50)] >= guessTens) {
      return {'background': '#D8BC09'}
    }
    return {}
  }

  computeNegShading(guessNegs: number)
  {
    let realRank1 = negData.indexOf(nameData[this.correct]["negs"])
    let realRank2 = negData.lastIndexOf(nameData[this.correct]["negs"])
    if (guessNegs === nameData[this.correct]["negs"]) {
      return {'background': 'green'}
    }
    if (negData[Math.max(realRank1-3,0)] <= guessNegs && negData[Math.min(realRank2+3,50)] >= guessNegs) {
      return {'background': '#D8BC09'}
    }
    return {}
  }

  computePPGShading(guessPPG: number) 
  {
    let correctPPG = nameData[this.correct]["pp20th"]
    if (guessPPG === correctPPG) {
      return {'background': 'green'}
    }
    if (Math.abs(guessPPG-correctPPG) <= 5) {
      return {'background': '#D8BC09'}
    }
    return {}
  }

  dirYear(guessYear: number) {
    if (guessYear > nameData[this.correct]["end_year"]) {
      return '🠗'
    }
    if (guessYear < nameData[this.correct]["end_year"]) {
      return '🠕'
    }
    return ''
  }

  dirTournaments(guessTournaments: number) {
    if (guessTournaments > nameData[this.correct]["tournaments_played"]) {
      return '🠗'
    }
    if (guessTournaments < nameData[this.correct]["tournaments_played"]) {
      return '🠕'
    }
    return ''
  }

  dirPowers(guessPowers: number) {
    if (guessPowers > nameData[this.correct]["powers"]) {
      return '🠗'
    }
    if (guessPowers < nameData[this.correct]["powers"]) {
      return '🠕'
    }
    return ''
  }

  dirTens(guessTens: number) {
    if (guessTens > nameData[this.correct]["tens"]) {
      return '🠗'
    }
    if (guessTens < nameData[this.correct]["tens"]) {
      return '🠕'
    }
    return ''
  }

  dirNegs(guessNegs: number) {
    if (guessNegs > nameData[this.correct]["negs"]) {
      return '🠗'
    }
    if (guessNegs < nameData[this.correct]["negs"]) {
      return '🠕'
    }
    return ''
  }

  dirPPG(guessPPG: number) {
    if (guessPPG > nameData[this.correct]["pp20th"]) {
      return '🠗'
    }
    if (guessPPG < nameData[this.correct]["pp20th"]) {
      return '🠕'
    }
    return ''
  }
  private getDailyAnswer() {
    var seedrandom = require('seedrandom')
    var dailyrng = seedrandom((new Date()).toISOString().substring(0, 10))
    // let prevNames = fs.readFileSync('names.txt').toString()
    // console.log(prevNames)
    dailyrng();
    let index = Math.floor(dailyrng()*51)
    let name = qbData[index]["name"] as keyof typeof nameData
    // let index = 33
    // let name = "Joe" as keyof typeof nameData

    this.id = nameData[name]["id"]
    return name
  }
  
  setHref() {
    const url = document.getElementById("URL") as HTMLAnchorElement | null;
    url!.href = "https://www.naqt.com/stats/player/index.jsp?contact_id=" + this.id
    return {color: '#303030'}
  }
}
