# crossfoam-dev-data
Data handling module

## General Data Structure

Web-Extensions can only use key-value storage for persistent data storage, due to the time it takes to acquire all the network information we need to rely on persisent storage and cannot use more fancy stuff. So it is basically all about hash-tables and smart key structures. The following json describes the structure of the extension's storage:

```
storage:{
  # The services are used to temporarily store the data gathered from a service, this data is later transformed into network data, stored under the networks key 
  services:{
    TWITTER:{
      users:[
        CENTRALNODE
      ],
      analysis:{
        # CENTRALNODE is the id of the user/account/xx used to build a network. The uuid is added to allow users to create multiple networks from the same user, e.g. at different timestamps
        CENTRALNODE-uuid:{
          centralnode:{
            id:string,
            name:string,
            handle:string,
            image:string
          },
          nodes:{
            node-ID:{
              name:string,
              handle:string,
              image:string,
              friends:[
                IDs
              ],
              followers:[
                IDs
              ],
            },
            ...
          },
          network:{
            nodes:[
              {
                id:integer,
                name:string,
                image:string,
                type:integer(0:normal|1:proxy),
                cluster:integer(-1:no cluster|1:...)
              },
              ...
            ],
            edges:[
              {
                from:integer(nodes-id),
                to:integer(nodes-id),
                strength:float,
                type:integer(0:normal|1:proxy)
              },
              ...
            ]
          },
          clusters:{
            clusterType_N:{
              clusterID:{
                name:,
                color:
              },
              ...
            },
            ...
          }
        },
        ...
      }
    }
  },
}
```

through `browser.storage.local.get` we can only get top level elements of our objects, this means everything is being loaded into memory even if we specifically know what we want, therefore, we use a flattened tree that works as follows:

```
storage.services.TWITTER.analysis.CENTRALNODE-uuid.centralnode 

# is being turned into

storage.services--TWITTER--analysis--CENTRALNODE-uuid--centralnode
```

At a certain depths the remaining content is then stored as objects, the following flat links are provided:

- storage.services--TWITTER--analysis--CENTRALNODE-uuid--centralnode
- storage.services--TWITTER--analysis--CENTRALNODE-uuid--nodes--nodeID
- storage.services--TWITTER--analysis--CENTRALNODE-uuid--proxies--proxy-ID
- storage.services--TWITTER--analysis--CENTRALNODE-uuid--network--nodes
- storage.services--TWITTER--analysis--CENTRALNODE-uuid--network--edges
- storage.services--TWITTER--analysis--CENTRALNODE-uuid--clusters--clusterID

The above makes it hard to find out what we actually have in store, therefore, we introduce lists, which keep track:

- storage.serviceList > names of services and created CENTRALNODEs
- storage.networkList > created CENTRALNODEs

- storage.services--TWITTER--analysis--CENTRALNODE-uuid--nodeList
- storage.services--TWITTER--analysis--CENTRALNODE-uuid--proxyList
- storage.services--TWITTER--analysis--CENTRALNODE-uuid--clusterList

TODO: In order to reduce the storage size, the keys are reduced:

services > s
analysis > a
centralnode > c
nodes > n
network > nw
users > u


## Storage Dictionary

In order to allow the system to check if a user has already been scraped, it contains an additional list of userids and their respective CENTRALNODE-uuid references

- storage.services--TWITTER--networks--USERID > [{uuid:uuid, call_count: number, state: queuing|waiting|running|completed}]

## Queuing

There are many things that need to be queued, normally we could use calbacks and promises to simple chain everything together. But we have to take one important thing into take in account, the browser might be closed or the internet connection might be turned off, leaving us with an incomplete queue. Therefore, the extension has a queue module, which knows what to do next. The backbone of the queue is also stored in the local storage, allowing us to retrieve and pick up the queue when ever something unfortunate happens.

The queue is an object, each key represents a function call, holding an array of requests to that function containing parameters

startTime allows sorting the calls by time of first initiation, while some functions will lead to arrows, if the error is handled properly the function adds itself back to the queue for another try. If another scrape was initiated in the meantime, this will push this re-call back to end of the queue, meaning the first scrape cannot finish before the second scrape is finished. In order to overcome this, the queue is re-sorted by the original initiation time. 

uniqueID connects various queue calls to one scrape process, thereby, allowing for the removale of proceses and all queue calls. As queue calls might be pending, there is another dicitionary for removed uniqueIDs, skipping future adding of connected calls to the queue.

 ```
storage:{
  queue:{
    networkAnalysis:[
      [
        [
          param-1,
          param-2,
          param-3
        ],
        startTime,
        uniqueID
      ],
    ]
  }
}

 ```

## Clusters (Bubbles)

For the network visualisation and analysis, the networks are stored within the above structure, but beyond that, the modification of html pages needs to quickly find out if a user exists in a cluster, therefore user's association with a cluster is store 

```
storage:{
  services:{
    TWITTER:{
      nodes:{
        USERID:[
          [CENTRALNODE-uuid, CLUSTER-KEY],
          ...
        ],
        ...
      }
    },
    ...
  }
}
```

The corresponding flat keys are:

- storage.services--TWITTER--nodes--USERID