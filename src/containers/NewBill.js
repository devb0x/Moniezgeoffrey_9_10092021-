
import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.firestore = firestore
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    new Logout({ document, localStorage, onNavigate })
  }

  mimeType(header) {
    switch (header) {
      case "89504e47":
          file.type = "image/png";
          break;
      case "47494638":
          type = "image/gif";
          break;
      case "ffd8ffe0":
      case "ffd8ffe1":
      case "ffd8ffe2":
      case "ffd8ffe3":
      case "ffd8ffe8":
          type = "image/jpeg";
          break;
      default:
          type = "unknown"; // Or you can use the blob.type as fallback
          break;
    }
    console.log(type)
    return type
  }

  handleChangeFile = e => {
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    // let file = e.dataTransfert
    let blob = file;
    let fileReader = new FileReader()

    console.log(file)
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length-1]

    // modif here bug hunt bills
    const fileExt = filePath[filePath.length-1].split('.').pop().toLowerCase()
    console.warn(fileExt)
    console.log(fileName)
    console.log(file.type)

    fileReader.onloadend = function(e) {
      // console.log('start ?')
      let arr = (new Uint8Array(e.target.result)).subarray(0, 4);
      let header = "";
      for(let i = 0; i < arr.length; i++) {
         header += arr[i].toString(16);
         console.warn(header)
      }
      console.log(header)
      // this.mimeType(header)

      console.log(file.type)
      console.log(file.name)
      console.log(file.size)

      fileReader.readAsArrayBuffer(blob);
      console.log(blob)
    
    };
  //   fileReader.readAsArrayBuffer(blob);


  // if (fileExt === 'mp4') {
  //   console.log('mp4')
  //   return
  // }
  // end modif

    this.firestore
      .storage
      .ref(`justificatifs/${fileName}`)
      .put(file)
      .then(snapshot => snapshot.ref.getDownloadURL())
      .then(url => {
        this.fileUrl = url
        this.fileName = fileName
      })
  }
  handleSubmit = e => {
    e.preventDefault()
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.createBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  createBill = (bill) => {
    if (this.firestore) {
      this.firestore
      .bills()
      .add(bill)
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => error)
    }
  }
}