//File de javascript. Meteremos el buttom para interactuar con el cliente. Y las funciones FUND, WITHDRAW.
/**
 * ! Esta version del proyecto, lo estamos haceindo sin front-end framework. Por lo que estamos utilizando front-end javascript.
 * !Esto quiere decir, que para importar, no utilizamos require sino IMPORT.
 */
import { ethers, providers } from "./ethers-5.6.esm.min.js";
import { ABI } from "./constants.js";
import { contractAddress } from "./constants.js";

/**
 * !Porque es archivo MODULE, tenemos que especificar el Onclick aquí.
 */

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
const form = document.getElementById("form");
const showBalance = document.getElementById("showBalance");
const result = document.getElementById("result");

connectButton.onclick = metamaskButton;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function metamaskButton() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.log(error);
    }
    connectButton.innerHTML = "Connected!";
    const accounts = await ethereum.request({ method: "eth_accounts" });
    console.log(accounts);

    fundButton.style.display = "block";
    balanceButton.style.display = "block";
    withdrawButton.style.display = "block";
    form.style.display = "block";
    showBalance.style.display = "flex";

    setTimeout(() => {
      connectButton.style.display = "none";
      const wrapp = document.getElementById("divWrapper");
      wrapp.style.height = "30vh";
    }, 1000);
    alert("You are Succesfully connected to Metamask");
  } else {
    connectButton.innerHTML = "Install Metamask";
  }
}

//FUND FUNCTION

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`Funding with ${ethAmount}...`);

  if (typeof window.ethereum !== "undefined") {
    /**
     * * necesitaremos el provider , signer/wallet
     * *Tambein ncesitamos el COntract: ABI & ADDRESS
     */

    const provider = new ethers.providers.Web3Provider(window.ethereum); // metodo para wrappear metamask y conseguir el provider
    const signer = provider.getSigner(); //Porque es la cuenta de meteamask, la nuestra
    const contract = new ethers.Contract(contractAddress, ABI, signer);

    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      /**
       * !Aqui le decimos a nuestra function que espere a enseñar en la consola, el minado de la transaccion y que no vaya adelante hasta mostralo.
       */
      await listenForTransactionMine(transactionResponse, provider);
      console.log("done!!");
    } catch (error) {
      console.log(error);
    }
  }
}

/**
 * ! En el front end, no tenemos nada que nos diga en la consola que la transaccion ha sido realizada con éxito, por ello vamos a
 * !incorporar un evento Listener para hacer ver el minado de la transaccion y la confirmación de bloques (al igual que hace etherscan)
 * ! Para ello creamos una function nueva llamada listenForTransactionMine(que tiene dos parametros= transactionResponse, provider)
 * !NOTA: function no async.
 */

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Transcation mined hash: ${transactionResponse.hash}`);
  /**
   * !Debemos meter la parte de provider.once en una promesa de tipo resolve,reject. Porque si no JS no se espera a completar esta parte del codigo.
   */
  return new Promise((resolve, reject) => {
    /**
     * ! COn esta funcion lo que estamos diciendo es que, una vez que se encuentre el transactionResponse.hash, pase a esperar y a enseñar
     * !el numero de bloques de confirmacion de la transaccion. JS no va  a seguir hasta que la Promise de un resultado de RESOLVE, o REJECT
     * ! EN este caso, le hemos dicho que una vez que enseñe la confirmacion que se ejecute resolve().
     */
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} blocks confirmations`
      );
      resolve();
    });
  });
}

async function getBalance() {
  if (typeof window.ethereum !== undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum); // metodo para wrappear metamask y conseguir el provider
    const balance = await provider.getBalance(contractAddress);
    const balanceFormatted = ethers.utils.formatEther(balance);

    console.log(`Your updated balance is: ${balanceFormatted}`);
    result.style.display = "block";
    result.innerHTML = "Your updated balance is: " + balanceFormatted + "Eth";
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    console.log("Withdrawing...");
    const provider = new ethers.providers.Web3Provider(window.ethereum); // metodo para wrappear metamask y conseguir el provider
    const signer = provider.getSigner(); //Porque es la cuenta de meteamask, la nuestra
    const contract = new ethers.Contract(contractAddress, ABI, signer);

    try {
      const transactionResponse = await contract.withdraw({});
      /**
       * !Aqui le decimos a nuestra function que espere a enseñar en la consola, el minado de la transaccion y que no vaya adelante hasta mostralo.
       */
      await listenForTransactionMine(transactionResponse, provider);
      console.log("done!!");
    } catch (error) {
      console.log(error);
    }
  }
}
