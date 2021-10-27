import { screen, fireEvent } from "@testing-library/dom"
import Bills from "../containers/Bills.js"

import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"

import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import Router from "../app/Router.js"
import Firestore from '../app/Firestore'

import { localStorageMock } from '../__mocks__/localStorage.js'

jest.mock('../app/Firestore')

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})
window.localStorage.setItem(
  'user',
  JSON.stringify({
    type: 'Employee'
  })
)

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({
    pathname
  })
}

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    // const pathname = ROUTES_PATH['Bills']

    Firestore.bills = () => ({
      bills,
      get: jest.fn().mockResolvedValue()
    })


    
    document.body.innerHTML = `<div id="root"></div>`

    // $.fn.modal = jest.fn()
  })
  describe("When i am on Bils Page but it's loading", () => {
    test("Then i should land on loading page", () => {
      const html = BillsUI({
        data: [],
        loading: true
      })
      document.body.innerHTML = html

      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  describe("When i am on Bills Page but the backend send an error message", () => {
    test("Then i should land on error page", () => {
      const html = BillsUI({
        data: [],
        loading: false,
        error: 'Something get wrong'
      })
      document.body.innerHTML = html

      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const pathname = ROUTES_PATH['Bills']

      Object.defineProperty(window, 'location', {
        value: {
          hash: pathname
        }
      })

      Router()

      const iconWindow = document.querySelector('#layout-icon1')

      expect(screen.getByTestId('icon-window')).toBeTruthy()
      expect(iconWindow.classList.contains('active-icon')).toBe(true)
    })

    test("Then bills should be ordered from earliest to latest", () => {
      const pathname = ROUTES_PATH['Bills']

      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe("Given i am connected aas an Employee and i am on the Bills page", () => {
      describe("When i click on  the New Bill button", () => {
        test("When i click on new bill i should be redirect on newbill", () => {
          const html = BillsUI({ data: [] })
          document.body.innerHTML = html
    
          const firestore = null
    
          const allBills = new Bills({
            document,
            onNavigate,
            firestore,
            localStorage: window.localStorage,
          });
    
          const handleClickNewBill = jest.fn(allBills.handleClickNewBill)
          // Get button eye in DOM
          const billBtn = screen.getByTestId('btn-new-bill')
    
          // Add event and fire
          billBtn.addEventListener('click', handleClickNewBill)
          fireEvent.click(billBtn)
    
          // screen should show Envoyer une note de frais
          expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
        })
      })
    })
  })

  describe("When i click on an icon eye", () => {
    test("A modal should open", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      const firestore = null
      const allBills = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage
      })

      $.fn.modal = jest.fn()

      const eye = screen.getAllByTestId('icon-eye')[0]
      console.log(eye)

      const handleClickIconEye = jest.fn(() => {
        allBills.handleClickIconEye(eye)
      })

      eye.addEventListener('click', handleClickIconEye)
      fireEvent.click(eye)

      expect(handleClickIconEye).toHaveBeenCalledTimes(1)

      const modale = document.getElementById('modaleFile')

      expect(modale).toBeTruthy()
    })
  })
})
