# Snippets for Azure Cognitive Search

This extension includes snippets for all major resources within Azure Cognitive Search including indexes, indexers, skillsets, data sources, and synonym maps.

Below is a list of all included snippets.

## Index snippets

### Index (azs-index)

```json
{
    "name": "my-index",
    "fields": [
      {
        "name": "id",
        "type": "Edm.String",
        "key": true,
        "searchable": true,
        "filterable": false,
        "facetable": false,
        "sortable": true
      },
      {
        "name": "text",
        "type": "Edm.String",
        "sortable": false,
        "searchable": true,
        "filterable": false,
        "facetable": false
      }
    ]
}
```

### Field (azs-field)

```json
{
    "name": "Name",
    "type": "Edm.String",
    "searchable": true,
    "filterable": false,
    "sortable": false,
    "facetable": false
}
```

### Complex Field (azs-field-complex)

```json
{
    "name": "Address",
    "type": "Edm.ComplexType",
    "fields": [
        {
            "name": "StreetAddress",
            "type": "Edm.String",
            "filterable": false,
            "sortable": false,
            "facetable": false,
            "searchable": true
        },
        {
            "name": "City",
            "type": "Edm.String",
            "searchable": true,
            "filterable": true,
            "sortable": true,
            "facetable": true
        },
        {
            "name": "StateProvince",
            "type": "Edm.String",
            "searchable": true,
            "filterable": true,
            "sortable": true,
            "facetable": true
        }
    ]
}
```

### Scoring Profile (azs-scoring-profile)

```json
"scoringProfiles": [
  {
    "name": "geo",
    "text": {
      "weights": {
        "hotelName": 5
      }
    },
    "functions": [
      {
        "type": "distance",
        "boost": 5,
        "fieldName": "location",
        "interpolation": "logarithmic",
        "distance": {
          "referencePointParameter": "currentLocation",
          "boostingDistance": 10
        }
      }
    ]
  }
]
```

### Analyzer (azs-analyzer)

```json
"analyzers":[
    {
       "name":"my_analyzer",
       "@odata.type":"#Microsoft.Azure.Search.CustomAnalyzer",
       "charFilters":[
          "map_dash",
          "remove_whitespace"
       ],
       "tokenizer":"my_standard_tokenizer",
       "tokenFilters":[
          "my_asciifolding",
          "lowercase"
       ]
    }
 ],
 "charFilters":[
    {
       "name":"map_dash",
       "@odata.type":"#Microsoft.Azure.Search.MappingCharFilter",
       "mappings":["-=>_"]
    },
    {
       "name":"remove_whitespace",
       "@odata.type":"#Microsoft.Azure.Search.MappingCharFilter",
       "mappings":["\\u0020=>"]
    }
 ],
 "tokenizers":[
    {
       "name":"my_standard_tokenizer",
       "@odata.type":"#Microsoft.Azure.Search.StandardTokenizerV2",
       "maxTokenLength":20
    }
 ],
 "tokenFilters":[
    {
       "name":"my_asciifolding",
       "@odata.type":"#Microsoft.Azure.Search.AsciiFoldingTokenFilter",
       "preserveOriginal":true
    }
 ]
```

## Indexer snippets

### Indexer (azs-indexer)

```json
{
    "name": "myIndexer",
    "dataSourceName": "myDataSource",
    "targetIndexName": "myIndex",
    "skillsetName": "mySkillset",
    "fieldMappings": [
        {
            "sourceFieldName": "metadata_storage_path",
            "targetFieldName": "id",
            "mappingFunction": {
                "name": "base64Encode"
            }
        }
    ]
}
```

## Indexing

### Upload data (azs-upload)

```json
{
    "value": [
        {
            "@search.action": "upload",
            "id": 1,
            "text": "Let's get this into a search index!"
        },
        {
            "@search.action": "upload",
            "id": 2,
            "text": "Index me please"
        }
    ]
}
```

## Data sources

### Azure Blob data source (azs-datasource-blob)

```json
{
    "name": "blob-datasource",
    "type": "azureblob",
    "credentials": {
        "connectionString": "DefaultEndpointsProtocol=https;AccountName=<account name>;AccountKey=<account key>;"
    },
    "container": {
        "name": "my-container",
        "query": "<optional-virtual-directory-name>"
    }
}
```

### Azure Cosmos DB data source (azs-datasource-cosmos)

```json
{
    "name": "mycosmosdbdatasource",
    "type": "cosmosdb",
    "credentials": {
        "connectionString": "AccountEndpoint=https://myCosmosDbEndpoint.documents.azure.com;AccountKey=myCosmosDbAuthKey;Database=myCosmosDbDatabaseId"
    },
    "container": {
        "name": "myCollection",
        "query": null
    },
    "dataChangeDetectionPolicy": {
        "@odata.type": "#Microsoft.Azure.Search.HighWaterMarkChangeDetectionPolicy",
        "highWaterMarkColumnName": "_ts"
    }
}
```

### Azure SQL data source (azs-datasource-sql)

```json
{
    "name": "myazuresqldatasource",
    "type": "azuresql",
    "credentials": {
        "connectionString": "Server=tcp:<your server>.database.windows.net,1433;Database=<your database>;User ID=<your user name>;Password=<your password>;Trusted_Connection=False;Encrypt=True;Connection Timeout=30;"
    },
    "container": {
        "name": "name of the table or view that you want to index"
    }
}
```

### Azure Table data source (azs-datasource-table)

```json
{
    "name": "table-datasource",
    "type": "azuretable",
    "credentials": {
        "connectionString": "DefaultEndpointsProtocol=https;AccountName=<account name>;AccountKey=<account key>;"
    },
    "container": {
        "name": "my-table",
        "query": "PartitionKey eq '123'"
    }
}
```

## Synonym Maps

### Synonym Map (azs-synonym)

```json
{
    "name": "my-synonyms",
    "format":"solr",
    "synonyms": "
       USA, United States, United States of America\n
       Washington, Wash., WA => WA\n"
 }
```

## Skillset snippets

### Skillset (azs-skillset)

```json
{
    "description": "Extract text from images and merge with content text to produce merged_text",
    "skills":
    [
      {
          "description": "Extract text (plain and structured) from image.",
          "@odata.type": "#Microsoft.Skills.Vision.OcrSkill",
          "context": "/document/normalized_images/*",
          "defaultLanguageCode": "en",
          "detectOrientation": true,
          "inputs": [
            {
              "name": "image",
              "source": "/document/normalized_images/*"
            }
          ],
          "outputs": [
            {
              "name": "text"
            }
          ]
      },
      {
        "@odata.type": "#Microsoft.Skills.Text.MergeSkill",
        "description": "Create merged_text, which includes all the textual representation of each image inserted at the right location in the content field.",
        "context": "/document",
        "insertPreTag": " ",
        "insertPostTag": " ",
        "inputs": [
          {
            "name":"text", "source": "/document/content"
          },
          {
            "name": "itemsToInsert", "source": "/document/normalized_images/*/text"
          },
          {
            "name":"offsets", "source": "/document/normalized_images/*/contentOffset"
          }
        ],
        "outputs": [
          {
            "name": "mergedText", "targetName" : "merged_text"
          }
        ]
      }
    ]
  }
```

### Knowledge Store (azs-knowledge-store)

```json
"knowledgeStore": {
    "storageConnectionString": "<an Azure storage connection string>",
    "projections": [
        {
            "tables": []
        },
        {
            "objects": [
                {
                    "storageContainer": "containername",
                    "source": "/document/EnrichedShape/",
                    "key": "/document/Id"
                }
            ]
        }
    ]
}
```

### Conditional skill (azs-skill-conditional)

```json
{
    "@odata.type": "#Microsoft.Skills.Util.ConditionalSkill",
    "context": "/document",
    "inputs": [
        { "name": "condition", "source": "= $(/document/language) == 'fr'" },
        { "name": "whenTrue", "source": "/document/sentences" },
        { "name": "whenFalse", "source": "= null" }
    ],
    "outputs": [ { "name": "output", "targetName": "frenchSentences" } ]
}
```

### Custom entity skill (azs-skill-custom-entity)

```json
{
    "@odata.type": "#Microsoft.Skills.Text.CustomEntityLookupSkill",
    "context": "/document",
    "inlineEntitiesDefinition":
    [
      {
        "name" : "Bill Gates",
        "description" : "Microsoft founder." ,
        "aliases" : [
            { "text" : "William H. Gates", "caseSensitive" : false },
            { "text" : "BillG", "caseSensitive" : true }
        ]
      },
      {
        "name" : "Xbox One",
        "type": "Harware",
        "subtype" : "Gaming Device",
        "id" : "4e36bf9d-5550-4396-8647-8e43d7564a76",
        "description" : "The Xbox One product"
      }
    ],
    "inputs": [
      {
        "name": "text",
        "source": "/document/content"
      }
    ],
    "outputs": [
      {
        "name": "entities",
        "targetName": "matchedEntities"
      }
    ]
  }
```

### Custom web API skill (azs-skill-custom)

```json
{
    "@odata.type": "#Microsoft.Skills.Custom.WebApiSkill",
    "description": "A custom skill that can identify positions of different phrases in the source text",
    "uri": "https://contoso.count-things.com",
    "batchSize": 4,
    "context": "/document",
    "inputs": [
      {
        "name": "text",
        "source": "/document/content"
      },
      {
        "name": "language",
        "source": "/document/languageCode"
      },
      {
        "name": "phraseList",
        "source": "/document/keyphrases"
      }
    ],
    "outputs": [
      {
        "name": "hitPositions"
      }
    ]
  }
```

### Document extraction skill (azs-skill-document-extraction)

```json
{
    "@odata.type": "#Microsoft.Skills.Util.DocumentExtractionSkill",
    "parsingMode": "default",
    "dataToExtract": "contentAndMetadata",
    "configuration": {
        "imageAction": "generateNormalizedImages",
        "normalizedImageMaxWidth": 2000,
        "normalizedImageMaxHeight": 2000
    },
    "context": "/document",
    "inputs": [
      {
        "name": "file_data",
        "source": "/document/file_data"
      }
    ],
    "outputs": [
      {
        "name": "content",
        "targetName": "content"
      },
      {
        "name": "normalized_images",
        "targetName": "normalized_images"
      }
    ]
  }
```

### Entity recognition skill (azs-skill-entity-recognition)

```json
{
    "@odata.type": "#Microsoft.Skills.Text.EntityRecognitionSkill",
    "categories": [ "Person", "Email"],
    "defaultLanguageCode": "en",
    "includeTypelessEntities": true,
    "minimumPrecision": 0.5,
    "inputs": [
      {
        "name": "text",
        "source": "/document/content"
      }
    ],
    "outputs": [
      {
        "name": "persons",
        "targetName": "people"
      },
      {
        "name": "emails",
        "targetName": "contact"
      },
      {
        "name": "entities"
      }
    ]
  }
```

### Image analysis skill (azs-skill-image-analysis)

```json
{
    "description": "Extract image analysis.",
    "@odata.type": "#Microsoft.Skills.Vision.ImageAnalysisSkill",
    "context": "/document/normalized_images/*",
    "defaultLanguageCode": "en",
    "visualFeatures": [
        "tags",
        "categories",
        "description",
        "faces",
        "brands"
    ],
    "inputs": [
        {
            "name": "image",
            "source": "/document/normalized_images/*"
        }
    ],
    "outputs": [
        {
            "name": "categories"
        },
        {
            "name": "tags"
        },
        {
            "name": "description"
        },
        {
            "name": "faces"
        },
        {
            "name": "brands"
        }
    ]
}
```

### Key phrase extraction skill (azs-skill-key-phrase)

```json
{
    "@odata.type": "#Microsoft.Skills.Text.KeyPhraseExtractionSkill",
    "inputs": [
      {
        "name": "text",
        "source": "/document/content"
      },
      {
        "name": "languageCode",
        "source": "/document/languagecode"
      }
    ],
    "outputs": [
      {
        "name": "keyPhrases",
        "targetName": "myKeyPhrases"
      }
    ]
  }
```

### Language detection skill (azs-skill-language-detection)

```json
{
    "@odata.type": "#Microsoft.Skills.Text.LanguageDetectionSkill",
    "inputs": [
      {
        "name": "text",
        "source": "/document/text"
      }
    ],
    "outputs": [
      {
        "name": "languageCode",
        "targetName": "myLanguageCode"
      },
      {
        "name": "languageName",
        "targetName": "myLanguageName"
      },
      {
        "name": "score",
        "targetName": "myLanguageScore"
      }

    ]
  }
```

### Merge text skill (azs-skill-merge)

```json
{
    "@odata.type": "#Microsoft.Skills.Text.MergeSkill",
    "description": "Create merged_text, which includes all the textual representation of each image inserted at the right location in the content field.",
    "context": "/document",
    "insertPreTag": " ",
    "insertPostTag": " ",
    "inputs": [
      {
        "name":"text", "source": "/document/content"
      },
      {
        "name": "itemsToInsert", "source": "/document/normalized_images/*/text"
      },
      {
        "name":"offsets", "source": "/document/normalized_images/*/contentOffset"
      }
    ],
    "outputs": [
      {
        "name": "mergedText", "targetName" : "merged_text"
      }
    ]
  }
```

### OCR skill (azs-skill-ocr)

```json
{
    "skills": [
      {
        "description": "Extracts text (plain and structured) from image.",
        "@odata.type": "#Microsoft.Skills.Vision.OcrSkill",
        "context": "/document/normalized_images/*",
        "defaultLanguageCode": null,
        "detectOrientation": true,
        "inputs": [
          {
            "name": "image",
            "source": "/document/normalized_images/*"
          }
        ],
        "outputs": [
          {
            "name": "text",
            "targetName": "myText"
          },
          {
            "name": "layoutText",
            "targetName": "myLayoutText"
          }
        ]
      }
    ]
  }
```

### PII detection skill (azs-skill-pii)

```json
{
    "@odata.type": "#Microsoft.Skills.Text.PIIDetectionSkill",
    "defaultLanguageCode": "en",
    "minimumPrecision": 0.5,
    "maskingMode": "replace",
    "maskingCharacter": "*",
    "inputs": [
      {
        "name": "text",
        "source": "/document/content"
      }
    ],
    "outputs": [
      {
        "name": "piiEntities"
      },
      {
        "name": "maskedText"
      }
    ]
  }
```

### Sentiment analysis skill (azs-skill-sentiment)

```json
{
    "@odata.type": "#Microsoft.Skills.Text.SentimentSkill",
    "inputs": [
        {
            "name": "text",
            "source": "/document/content"
        },
        {
            "name": "languageCode",
            "source": "/document/languagecode"
        }
    ],
    "outputs": [
        {
            "name": "score",
            "targetName": "mySentiment"
        }
    ]
}
```

### Shaper skill (azs-skill-shaper)

```json
{
    "@odata.type": "#Microsoft.Skills.Util.ShaperSkill",
    "context": "/document/content/phrases/*",
    "inputs": [
      {
        "name": "text",
        "source": "/document/content/phrases/*"
      },
      {
        "name": "sentiment",
        "source": "/document/content/phrases/*/sentiment"
      }
    ],
    "outputs": [
      {
        "name": "output",
        "targetName": "analyzedText"
      }
    ]
  }
```

### Split skill (azs-skill-split)

```json
{
    "@odata.type": "#Microsoft.Skills.Text.SplitSkill",
    "textSplitMode" : "pages",
    "maximumPageLength": 1000,
    "defaultLanguageCode": "en",
    "inputs": [
        {
            "name": "text",
            "source": "/document/content"
        },
        {
            "name": "languageCode",
            "source": "/document/language"
        }
    ],
    "outputs": [
        {
            "name": "textItems",
            "targetName": "mypages"
        }
    ]
}
```

### Text translation skill (azs-skill-translation)

```json
{
    "@odata.type": "#Microsoft.Skills.Text.TranslationSkill",
    "defaultToLanguageCode": "fr",
    "suggestedFrom": "en",
    "context": "/document",
    "inputs": [
      {
        "name": "text",
        "source": "/document/text"
      }
    ],
    "outputs": [
      {
        "name": "translatedText",
        "targetName": "translatedText"
      },
      {
        "name": "translatedFromLanguageCode",
        "targetName": "translatedFromLanguageCode"
      },
      {
        "name": "translatedToLanguageCode",
        "targetName": "translatedToLanguageCode"
      }
    ]
  }
```
