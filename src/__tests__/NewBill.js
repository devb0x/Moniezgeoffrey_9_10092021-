import { screen, fireEvent, wait } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import Dashboard from "../containers/Dashboard.js"
import userEvent from "@testing-library/user-event"

import { bills } from "../fixtures/bills"
import { ROUTES_PATH } from "../constants/routes.js"
import firebase from '../__mocks__/firebase'
import Firestore from '../app/Firestore'

import { localStorageMock } from '../__mocks__/localStorage.js'
import Router from "../app/Router.js"

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

const newBill = {
  id: 'alkzezae',
  status: 'refused',
  pct: 20,
  amount: 150,
  email: 'test@test.fr',
  name: 'newBillFixture',
  vat: '40',
  filename: 'somename.jpg',
  date: '2021-01-02',
  commentAdmin: 'ben voyons',
  commentary: 'allez..',
  type: 'Transport',
  fileUrl: 'see later'
}

const onNavigate = (pathname) => {
  document.body.innerHTML = pathname
}


describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    const pathname = ROUTES_PATH['NewBill']

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
  })

  describe("When I am on NewBill Page", () => {
    test("Then the icon mail should be highlighted", () => { // ok
      Router()

      const iconMail = document.querySelector('#layout-icon2')

      expect(screen.getByTestId('icon-mail')).toBeTruthy()
      expect(iconMail.classList.contains('active-icon')).toBe(true)
    })
  })

  describe("when the form is valid", () => {
    test("then i submit the form", () => {
      const firestore = null
      const html = NewBillUI()
      document.body.innerHTML = html

      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage
      })

      const handleSubmit = jest.fn(newBill.handleSubmit)

      const submitBtn = screen.getByTestId('form-new-bill')
      submitBtn.addEventListener('submit', handleSubmit)
      fireEvent.submit(submitBtn)

      expect(handleSubmit).toHaveBeenCalled()
    })
  })

  // describe('When I choose an image to upload', () => {
    // test('Then the file input should get the file name', () => {
    //     // build user interface
    //     const html = NewBillUI();
    //     document.body.innerHTML = html;

    //     // Init newBill
    //     const newBill = new NewBill({
    //         document,
    //         onNavigate,
    //         firestore: null,
    //         localStorage: window.localStorage,
    //     });

    //     // Mock function handleChangeFile
    //     const handleChangeFile = jest.fn(() => newBill.handleChangeFile);

    //     // Add Event and fire
    //     const inputFile = screen.getByTestId('file');
    //     inputFile.addEventListener('change', handleChangeFile);

    //     // Launch event
    //     fireEvent.change(inputFile, {
    //         target: {
    //             files: [new File(['image.png'], 'image.png', {
    //                 type: 'image/png'
    //             })],
    //         }
    //     });

    //     // handleChangeFile function must be called
    //     expect(handleChangeFile).toBeCalled();
    //     // The name of the file should be 'image.png'
    //     console.log('undefined')
    //     expect(inputFile.files[0].name).toBe('image.png');
    //     console.log(inputFile.file[0].name)
    //     // expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
    //     // HTML must contain 'hideErrorMessage'
    //     // expect(html.includes("<div class=\"hideErrorMessage\" id=\"errorFileType\" data-testid=\"errorFile\">")).toBeTruthy();
    // });
  // });








})


  


