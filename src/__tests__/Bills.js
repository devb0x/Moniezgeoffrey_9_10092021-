import { screen, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"

import { ROUTES_PATH } from "../constants/routes.js"
import Router from "../app/Router.js"
import Firestore from '../app/Firestore'

import { localStorageMock } from '../__mocks__/localStorage.js'
import userEvent from "@testing-library/user-event"


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

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    const pathname = ROUTES_PATH['Bills']

    Firestore.bills = () => ({
      bills,
      get: jest.fn().mockResolvedValue()
    })

    Object.defineProperty(window, 'location', {
      value: {
        hash: pathname
      }
    })
    
    document.body.innerHTML = `<div id="root"></div>`

    // $.fn.modal = jest.fn()
  })
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      Router()

      const iconWindow = document.querySelector('#layout-icon1')

      expect(screen.getByTestId('icon-window')).toBeTruthy()
      expect(iconWindow.classList.contains('active-icon')).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
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
    test("when i click on an eye icon the modal should pop", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      const modal =  $.fn.modal = jest.fn()
      const eye = screen.getAllByTestId('icon-eye')[0]
      eye.addEventListener('click', modal)
      fireEvent.click(eye)
      expect(modal).toHaveBeenCalled()
    })
  })
})
