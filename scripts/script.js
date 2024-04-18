const { ethers } = require("hardhat");

// Función para obtener las direcciones que poseen un token específico
async function main() {
  try {
    const token = await ethers.getContractAt(
      "firstToken",
      "0x779e75aeA4f21b214CAF1CF39AbbD3d4442F3588"
    );
    const balance = await token.balanceOf(
      "0x360e45A63ef9aB47167B42625d3544C13910C923"
    );
    console.log(ethers.utils.formatEther(balance).toString());
    const balanceContract = await token.balanceOf(
      "0x88743EeD3a5322fEedf122feF468FC3c8Da0eCb7"
    );
    console.log(
      ethers.utils.formatEther(balance).toString(),
      "contract balance"
    );
  } catch (e) {
    console.error("Error", e);
  }
}

// Dirección del contrato del token en Binance Smart Chain

// Llamar a la función para obtener los titulares del token
main();
