export const queryMyMoonCats = (user: string): string => {
  return `{
    moonRescuers(where: { id: "${user.toLowerCase()}" }) {
      id,
      cats {
        id
        name
        inWallet
        rescueTimestamp
        activeAdoptionRequest {
          id
          price
          from
        }
        requestPrices {
          price
          timestamp
        }
        offerPrices {
          price
          timestamp
        } 
        activeAdoptionOffer {
          id
          price
          toAddress
        }
      }
    }
  }`;
};

export const queryCatById = (catId: string): string => {
  return `{
    cats(where: { id: "${catId}"} ) {
      id
      name
      inWallet
      activeAdoptionRequest {
        id
        price
        from
      }
      requestPrices {
        price
        timestamp
      }
      offerPrices {
        price
        timestamp
      } 
      activeAdoptionOffer {
        id
        price
        toAddress
      }
    }
  }`;
};

export const queryAllCats = (first: number, offset: number): string => {
  return `{
      cats(first: ${first}, skip: ${offset}) {
        id
        name
        inWallet
        rescueTimestamp
        activeAdoptionRequest {
          id
          price
          from
        }
        requestPrices {
          price
          timestamp
        }
        offerPrices {
          price
          timestamp
        } 
        activeAdoptionOffer {
          id
          price
          toAddress
        }
      }
  }`;
};
