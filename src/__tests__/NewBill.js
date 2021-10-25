import { screen, fireEvent, wait, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import Dashboard from "../containers/Dashboard.js"
import userEvent from "@testing-library/user-event"

import { bills } from "../fixtures/bills"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js"
import firebase from '../__mocks__/firebase'
import Firestore from '../app/Firestore'

import { localStorageMock } from '../__mocks__/localStorage.js'
import Router from "../app/Router.js"
import BillsUI from "../views/BillsUI.js"

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

describe("Given I am connected as an employee", () => {
  let onNavigate
  let newBill

  beforeEach(() => {
    $.fn.modal = jest.fn()

    document.body.innerHTML = NewBillUI();
    
    onNavigate = jest.fn((pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    })

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

    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: 'test@test.test',
      })
    )

    newBill = new NewBill({
      document,
      onNavigate,
      firestore: undefined,
      localStorage: window.localStorage,
    })

    document.body.innerHTML = `<div id="root"></div>`
  })

  describe("When I am on NewBill Page", () => {
    test("Then the icon mail should be highlighted", () => {
      Router()

      const iconMail = document.querySelector('#layout-icon2')

      expect(screen.getByTestId('icon-mail')).toBeTruthy()
      expect(iconMail.classList.contains('active-icon')).toBe(true)
    })
  })
  describe('When I choose an image to upload', () => {
    test('Then the file input should get the file name', () => {
        // build user interface
        const html = NewBillUI()
        document.body.innerHTML = html

        Object.defineProperty(window, 'localStorage', {
          value: localStorageMock
        })

        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
  
        // Init newBill
        const newBill = new NewBill({
            document,
            onNavigate,
            firestore: null,
            localStorage: window.localStorage,
        });

        // Mock function handleChangeFile
        const handleChangeFile = jest.fn(() => newBill.handleChangeFile)

        // Add Event and fire
        const inputFile = screen.getByTestId('file')
        inputFile.addEventListener('change', handleChangeFile)

        // Launch event
        fireEvent.change(inputFile, {
            target: {
                files: [new File(['image.png'], 'image.png', {
                    type: 'image/png'
                })],
            }
        })

        // handleChangeFile function must be called
        expect(handleChangeFile).toHaveBeenCalledTimes(1)
        // The name of the file should be 'image.png'
        expect(inputFile.files[0].name).toBe('image.png')
        expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
        // HTML must contain 'hideErrorMessage'
        expect(html.includes("<div class=\"hideErrorMessage\" id=\"errorFileType\" data-testid=\"errorFile\">")).toBeTruthy()
    });
  });

  describe("when the form is submited with an image (jpg, jpeg, or png", () => {
    test("Then it should create a new bill", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const bill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage
      })
      const handleSubmit = jest.fn(newBill.handleSubmit)

      const submitBtn = screen.getByTestId('form-new-bill')
      submitBtn.addEventListener('submit', handleSubmit)
      fireEvent.submit(submitBtn)
    })
  })

  describe('When i add a file and its the wrong format(jpg, jpeg, or png expected', () => {
    test("Then the bill shouldn't be created and i stay on NewBill page", () => {
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

      newBill.fileName = 'invalid'

      const submitBtn = screen.getByTestId('form-new-bill')
      submitBtn.addEventListener('click', handleSubmit)
      fireEvent.click(submitBtn)

      expect(handleSubmit).toHaveBeenCalled()
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
    })

    test('Then an error message should be displayed', async () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const newBill = new NewBill({
        document,
        onNavigate,
        Firestore,
        localStorage: window.localStorage
      })

      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)

      const inputFile = screen.getByTestId('file')
      inputFile.addEventListener('change', handleChangeFile)
      fireEvent.change(inputFile, {
        target: {
            files: [new File(['image.exe'], 'image.exe', {
                type: 'image/exe'
            })],
        }
      })

      expect(handleChangeFile).toBeCalled()
      expect(inputFile.files[0].name).toBe('image.exe')

      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
      await waitFor(() => {
        expect(screen.getByTestId('errorFile').classList).toHaveLength(0)
      })
    })
  })

  // POST
  describe("Given i am connected as an employee", () => {
    describe("When i create a new bill", () => {
      test("Add bill to mock API POST", async () => {
        // TODO (line 240)
      })
    })

    describe("When bill form is submitted", () => {
      test("Then add new bill", async () => {
        const html = NewBillUI()
        document.body.innerHTML = html

        const bill = new NewBill({
          document,
          onNavigate,
          firestore: null,
          localStorage: window.localStorage
        })

        expect(await bill.createBill(newBill)).toBeUndefined()
      })

      test("Then create Bill and redirect to Bills", () => {

        Object.defineProperty(window, 'localStorage', {
          value: localStorageMock
        })
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee'
          })
        )
        
        const html = NewBillUI()
        document.body.innerHTML = html

        newBill = new NewBill({
          document,
          onNavigate,
          firestore: undefined,
          localStorage: window.localStorage
        })

        screen.getByTestId('expense-type').value = newBill.type
        screen.getByTestId('expense-name').value = newBill.name
        screen.getByTestId('amount').value = newBill.amount
        screen.getByTestId('datepicker').value = newBill.date
        screen.getByTestId('vat').value = newBill.vat
        screen.getByTestId('pct').value = newBill.pct
        screen.getByTestId('commentary').value = newBill.commentary

        newBill.isFileValid = true;

        const submit = screen.getByTestId('form-new-bill')

        const handleSubmit = jest.fn(newBill.handleSubmit);
        submit.addEventListener('click', handleSubmit)
        userEvent.click(submit)

        expect(handleSubmit).toHaveBeenCalled()

        expect(newBill.onNavigate).toBeCalledTimes(1);

        expect(newBill.onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);        
      })
    })
  })

})

// test d'intégration GET
describe("Given I am a user connected as Admin", () => {
  describe("When I navigate to Dashboard", () => {
    test("fetches bills from mock API POST", async () => {
       const getSpy = jest.spyOn(firebase, "post")
       const bills = await firebase.post()
       expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(1)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})


  


