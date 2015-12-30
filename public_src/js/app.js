import Plot from './plot.js'
import Heatmap from './heatmap.js'
import { removeChildren, capitalizeFirstLetters, getMonthYear } from './helpers.js'

export class App {
  constructor () {
    this.chartNav = document.querySelector('.navbar-right')
    this.chartTitle = document.querySelector('.chart-title')
    this.chartContainer = document.getElementById('chart-container')
    this.chartDetail = document.getElementById('chart-detail')
    this.meta = JSON.parse(window.sessionStorage.getItem('meta'))
  }

  static getMeta () {
    const url = window.location.protocol + '//' + window.location.host + '/list'
    const headers = { Accept: 'application/json' }
    return window.fetch(url, headers).then(res => res.json()).then(meta => {
      window.sessionStorage.setItem('meta', JSON.stringify(meta))
    })
  }

  createSelections (text, ...dropdowns) {
    const navbarText = document.createElement('p')
    navbarText.classList.add('navbar-text')
    navbarText.textContent = text
    this.chartNav.appendChild(navbarText)

    const form = document.createElement('form')
    form.className = 'navbar-form form-inline'

    dropdowns.forEach(dropdown => {
      const selector = document.createElement('select')
      selector.setAttribute('id', dropdown.selector)
      selector.className = 'form-control'
      dropdown.options.forEach(item => {
        const option = document.createElement('option')
        option.textContent = item
        if (item === dropdown.defaultOption) option.setAttribute('selected', '')
        selector.add(option)
      })
      selector.addEventListener('change', event => this.drawChart())
      form.appendChild(selector)
    })
    this.chartNav.appendChild(form)
  }

  showLoader (element) {
    element.classList.add('loading')
  }

  createButtons () {
    const prevButton = document.createElement('button')
    prevButton.setAttribute('id', 'prev-month')
    prevButton.addEventListener('click', event => this.prevChart())
    this.chartNav.appendChild(prevButton)

    const nextButton = document.createElement('button')
    nextButton.setAttribute('id', 'next-month')
    nextButton.disabled = true
    nextButton.addEventListener('click', event => this.nextChart())
    this.chartNav.appendChild(nextButton)
  }
}

export class TimeSeries extends App {
  constructor () {
    super()

    this.drawForm()
    this.townSelection = document.getElementById('select-town')
    this.chartSelection = document.getElementById('select-chart')

    this.plotDiv = document.createElement('div')
    this.plotDiv.setAttribute('id', 'plot-space')
    this.chartContainer.appendChild(this.plotDiv)

    this.plot = new Plot(
      this.townSelection.options[this.townSelection.selectedIndex].text,
      this.chartSelection.options[this.chartSelection.selectedIndex].text,
      this.plotDiv
    )

    this.drawChart()
  }

  drawForm () {
    const text = 'Choose the town and data you wish to see'
    const towns = {
      options: this.meta.townList,
      selector: 'select-town',
      defaultOption: 'Ang Mo Kio'
    }
    const charts = {
      options: ['Average', 'Min, Max & Median'],
      selector: 'select-chart',
      defaultOption: 'Average'
    }
    this.createSelections(text, towns, charts)
  }

  drawChart () {
    this.showLoader(document.querySelector('main'))
    removeChildren(this.chartDetail)

    // this.plot.town = this.townSelection.options[this.townSelection.selectedIndex].text
    // this.plot.chartType = this.chartSelection.options[this.chartSelection.selectedIndex].text

    this.plot.town = this.townSelection.options[this.townSelection.selectedIndex].value
    this.plot.chartType = this.chartSelection.options[this.chartSelection.selectedIndex].value

    this.chartTitle.textContent =
      this.plot.chartType +
      ' of HDB Resale Price in ' +
      capitalizeFirstLetters(this.plot.town.toLowerCase())

    this.plot.plotChart()
  }
}

export class Maps extends App {
  constructor () {
    super()

    this.drawForm()

    this.monthSelection = document.getElementById('select-month')
    this.prevButton = document.getElementById('prev-month')
    this.nextButton = document.getElementById('next-month')

    this.mapDiv = document.createElement('div')
    this.mapDiv.setAttribute('id', 'map')
    this.chartContainer.appendChild(this.mapDiv)

    this.heatmap = new Heatmap(
      // this.monthSelection.options[this.monthSelection.selectedIndex].text,
      this.monthSelection.options[this.monthSelection.selectedIndex].value,
      this.mapDiv
    )
    this.drawChart()
  }

  drawForm () {
    const text = 'Choose the month'
    const months = {
      options: this.meta.monthList,
      selector: 'select-month',
      defaultOption: '2015-09'
    }
    this.createSelections(text, months)
    this.createButtons()
  }

  drawChart () {
    this.showLoader(document.querySelector('main'))
    this.heatmap.month = this.monthSelection.options[this.monthSelection.selectedIndex].text
    this.chartTitle.textContent = 'Hottest Areas in ' + getMonthYear(this.heatmap.month)
    this.withinMonthRange(this.monthSelection.selectedIndex)
    this.heatmap.plotHeatmap()
  }

  prevChart () {
    this.monthSelection.selectedIndex--
    this.drawChart()
  }

  nextChart () {
    this.monthSelection.selectedIndex++
    this.drawChart()
  }

  withinMonthRange (idx) {
    this.prevButton.disabled = false
    this.nextButton.disabled = false
    if (idx === 0) this.prevButton.disabled = true
    if (idx === this.meta.monthList.length - 1) this.nextButton.disabled = true
  }
}
