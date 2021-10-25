import NewBillUI from "../views/NewBillUI.js";

import { screen, fireEvent } from "@testing-library/dom";

import NewBill from "../containers/NewBill";

import { localStorageMock } from "../__mocks__/localStorage";

import { ROUTES, ROUTES_PATH } from "../constants/routes";

import userEvent from "@testing-library/user-event";

 

describe("Given I am connected as an employee", () => {

  let onNavigate;

  let newBill;

  beforeEach(async () => {

    $.fn.modal = jest.fn();

    document.body.innerHTML = NewBillUI();

    onNavigate = jest.fn((pathname) => {

      document.body.innerHTML = ROUTES({ pathname });

    });

    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    window.localStorage.setItem(

      "user",

      JSON.stringify({

        type: "Employee",

        email: 'test@test.test',

      })

    );

    newBill = new NewBill({

      document,

      onNavigate,

      firestore: undefined,

      localStorage: window.localStorage,

    });

  });

 

  describe("When I am on NewBill Page", () => {

    describe("When i send the form", () => {

      test("I should be redirect to the bill page", () => {

        newBill = new NewBill({

          document,

          onNavigate,

          firestore: undefined,

          localStorage,

        });

        screen.getByTestId("expense-type").value = "Transports";

        screen.getByTestId("expense-name").value = "test bill";

        screen.getByTestId("amount").value = "10";

        screen.getByTestId("datepicker").value = "2021-06-07";

        screen.getByTestId("vat").value = "";

        screen.getByTestId("pct").value = "20";

        screen.getByTestId("commentary").value = "test commentary";

        newBill.isFileValid = true;

        const handleSubmit = jest.fn(newBill.handleSubmit);

        const form = screen.getByTestId("form-new-bill");

        form.addEventListener("click", handleSubmit);

        userEvent.click(form);

        expect(handleSubmit).toHaveBeenCalled();

        expect(newBill.onNavigate).toBeCalledTimes(1);

        expect(newBill.onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
        
      });

    });

  });

});