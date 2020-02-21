Jurisdictions registry (Form where governments could upload geo json files and get it registered on Tezos Blockchain. Tezos blockchain will just store the reference to the file containing the exclusion zones location and Arweave is where the actual files are stored.

 

Front end

Required fields
	1. Geo json file
	2. Congestion charges (e.g. 0.2eth/m
	3. Tezos private key	
	4. Arweave key
	5. Other relevant information describing the government (e.g. country name, policy zone name...) 

Back end

On submit

	1. Geo json file will be saved to Arweave -> url will be returned, say geo_url
	2. Query smart contract on Tezos and get the nonce back (number of exclusion zones the 			  
             government registered  so far)
	3. Creates DID document, simple json/txt and generate hash of it.
	4. Save it to Arweave -> url will be returned, say document_url
		
			DID document on areweave
			{
				zoneID: (hash of Tezos public key and nonce?),
				owner:  public key, address of the owner,(msg.sender)
				properties: {countryname: “UnitedKingdom”, type: “congestionzone” etc...}
				Congestion charges: from input field 
				uri : geo_url	
			}
	5. Invoke smart contract and append DID containing the document_url to an array of struct DID.
	    Smart contract will have a mapping from government’s address to array containing exclusion 			     
	    zones. 
	6. If we have time we can add functionality that could update the zones or transferownership    
	    
	   		
                        Fields on smart contract
			mapping(Address -> Array<DID>) zoneRegisteration
			
			struct DID {
					zoneID: (hash of Tezos public key and nonce?),
					exists: Boolean indicating if a polygon is active or not,
					hash: hash of the content of the document_url
					uri: document_url	
				   } 
	

		

	


Tezos smart contract specification

Check out Tezos developer protocol.  (for writing smart contract, we can either use FI(JS based) or Smartpy(python based) and to interact with the contract ConseilJS can be used)


	MUST
		1)create/add
				-simple functionality to create a new polygon and add it to the array of DID, we 	            
				assume that the new polygon doesn’t overlap the previous polygones registered. 

	OPTIONAL
		2)update
				this will alter the pre existing polygon registered on blockchain. 
				It should first delete the old polygone(by setting ‘exists’ to false) and create/add the new one.
			
		3)transferOwnership 
				this will transfer ownership of the polygone. Not sure how to implement it without the recipient’s private key. 
				(we can manually have the sender delete it and ask the recipient to create one)
