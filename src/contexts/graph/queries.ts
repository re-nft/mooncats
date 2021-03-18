export const queryMyMoonCats = (user: string): string => {
  return `{
    owners(where: { id: "${user.toLowerCase()}" }) {
      id,
      cats {
        id
        name
        isWrapped
        rescueTimestamp
        activeRequest {
          id
          price
          from
        }
        activeOffer {
          id
          price
          to
        }
        provenance {
          offerPrices {
            id
            price
            to
            timestamp
            filled
            active
          }
          requestPrices {
            id
            price
            from
            timestamp
            filled
            active
          }
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
      isWrapped
      rescueTimestamp
      activeRequest {
        id
        price
        from
      }
      activeOffer {
        id
        price
        to
      }
      provenance {
        offerPrices {
          id
          price
          to
          timestamp
          filled
          active
        }
        requestPrices {
          id
          price
          from
          timestamp
          filled
          active
        }
      }
    }
  }`;
};

export const queryAllCats = (first: number, skip: number): string => {
  return `{
      cats(first: ${first}, skip: ${skip}) {
        id
        name
        isWrapped
        rescueTimestamp
        activeRequest {
          id
          price
          from
        }
        activeOffer {
          id
          price
          to
        }
        provenance {
          offerPrices {
            id
            price
            to
            timestamp
            filled
            active
          }
          requestPrices {
            id
            price
            from
            timestamp
            filled
            active
          }
        }
      }
  }`;
};

export const queryAllRequests = (): string => {
  return `{
    requestPrices(where: {active_in: [true]}) {
      id
      price
      from
      timestamp
      filled
      active
    }
  }`;
};

export const queryAllOffers = (first: number, skip: number): string => {
  return `{
    offerPrices(where: {active_in: [true]}, first: ${first}, skip: ${skip}) {
      id
      price
      to
      timestamp
      filled
      active
    }
  }`;
};
