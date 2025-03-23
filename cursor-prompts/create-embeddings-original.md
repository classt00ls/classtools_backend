'''
* Name: The name of the aggregate.
* Description: A brief description of the aggregate.
* Context: The context where the aggregate belongs.
* Properties: A list of properties that the aggregate has. Optionally, you can specify the type of each property.
* Enforced Invariants: A list of invariants that the aggregate enforces.
* Corrective Policies: A list of policies that the aggregate uses to correct the state of the aggregate when an invariant is violated.
* Domain Events: A list of events that the aggregate emits.
* Ways to access: A list of ways to access the aggregate.
'''

# Instructions to transform the Aggregate Design Blueprint to code:

You have to create:
* A module for the aggregate:
    * The module name should be the name of the aggregate in plural.
    * Should be written in $FOLDERS_CASE.
    * Should be inside the `src/contexts/$CONTEXT_NAME` directory.
* Every module contains 3 folders: `domain`, `application`, and `infrastructure`.
* Inside the `domain` folder, you'll have to create:
    * An `$AGGREGATE_NAME.$FILES_FORMAT file that contains the aggregate class:
        * The file name should be the name of the aggregate in PascalCase.
        * The aggregate class should have the properties, invariants, policies, and events that the aggregate has.
        * You should take a look to other aggregates to see the format.
    * A `$DOMAIN_EVENT.$FILES_FORMAT file per every event that the aggregate emits:
        * The file name should be the name of the event in PascalCase.
        * The event should have only the mutated properties.
        * You should take a look to other events to see the format.
    * A `$DOMAIN_ERROR.$FILES_FORMAT file per every invariant that the aggregate enforces:
        * The file name should be the name of the invariant in PascalCase.
        * You should take a look to other errors to see the format.
    * A `$REPOSITORY.$FILES_FORMAT file that contains the repository interface:
        * The file name should be the name of the aggregate in PascalCase with the suffix `Repository`.
        * The repository should have the methods to save and retrieve the aggregate.
        * You should take a look to other repositories to see the format.
* Inside the `application` folder, you'll have to create:
    * A folder using $FOLDERS_CASE for every mutation that the aggregate has (inferred by the domain events) and for every query that the aggregate has.
    * Inside every query/mutation folder, you'll have to create an `$USE_CASE.$FILES_FORMAT file that contains the query/mutation use case.
        * The file name should be the name of the query/mutation in PascalCase in a service mode. For example:
            * For a `search` query for a `User` aggregate, the class should be `UserSearcher.$FILES_FORMAT.
            * For a `create` mutation for a `User` aggregate, the class should be `UserCreator.$FILES_FORMAT.
        * You should take a look to other queries/mutations to see the format.
* Inside the `infrastructure` folder, you'll have to create:
    * A `$REPOSITORY.$FILES_FORMAT file that contains the repository implementation:
        * The file name should be the name of the aggregate in PascalCase with the suffix `Repository`.
        * Also, the file should have an implementation prefix. For example, for a `User` aggregate and a Postgres implementation, the file should be `PostgresUserRepository.$FILES_FORMAT.
        * The repository should implement the repository interface from the domain layer.
        * You should take a look to other repositories to see the format and use the most used implementation.
* You'll have to create a test per every use case:
    * The test should be inside the `tests/contexts/$CONTEXT_NAME/$MODULE_NAME/application` directory.
    * You should create an Object Mother per every aggregate and value object that you create inside `tests/contexts/$CONTEXT_NAME/$MODULE_NAME/domain`.
    * Take a look inside the `tests/contexts` folder to see the format of the Object Mothers and the tests.
    * You should only create a test per every use case, don't create any extra test case.
* You should create a test for the repository implementation:
    * The test should be inside the `tests/contexts/$CONTEXT_NAME/$MODULE_NAME/infrastructure` directory.

# Protocol to execute the transformation:

## 1. Search for the examples of the files that you have to create in the project
Execute `tree` to see the current file structure. Then use `cat` to see the content of similar files.

## 2. Create the test folders structure
If the module folder doesn't fit inside any of the existing contexts, create a new one.

## 3. Create the test for the first use case
* We should create use case by use case, starting with the first one.
* We're doing TDD, so we'll create the first use case test first.
* Also, we'll create all the object mothers.
* Then all the domain objects (if needed).
* Then the use case.
* Do it until the created test passes.
* Repeat this per every use case.

## 4. Create the repository implementation test
* We should create the repository implementation test after all the use cases are created.
* First, create the repository implementation test.
* Then, create the repository implementation.
* Do it until the created test passes.

# User variables:

$FOLDERS_CASE = kebab-case
$FILES_FORMAT = ts

# Aggregate Design Blueprint:

IMPORTANT: Al crear los archivos revisar a fondo todos los documentos de markdown .md que hay en la raiz del proyecto, ya que contienen informacion detallada de como está todo construido. Respetar al máximo posible lo que se refleja de esos documentos.

'''
* Name: Embedding
* Description: Aggregate root that represents textual content prepared for semantic search and similarity retrieval, optimized for PGVectorStore integration.
* Context: Shared
* Properties:
  - id: string (unique identifier that will be used as the document ID in PGVectorStore)
  - content: string (textual content from which the vector will be generated, corresponds to pageContent in Document)
  - metadata: Record<string, any> (additional properties for filtering results that don't affect the semantic vector)
  - createdAt: Date (creation timestamp)
  - updatedAt: Date (last update timestamp)
* Enforced Invariants:
  - Content must never be empty or null
  - ID must be unique across all embeddings
  - Metadata should only contain data that won't affect vector similarity (not semantic content)
  - Content should be properly preprocessed for optimal vector representation
  - Metadata must be serializable to JSON
* Corrective Policies:
  - If content is empty, reject the embedding creation
  - Clean and normalize content text before embedding generation (remove excessive whitespace, normalize Unicode)
  - Validate metadata structure to ensure it can be properly stored in PGVectorStore
  - Ensure content includes all semantically relevant information that should influence embedding
  - Move semantic content from metadata to content field if detected
* Domain Events:
  - EmbeddingCreated: Emitted when a new embedding is successfully created
  - EmbeddingUpdated: Emitted when existing embedding content is modified
  - EmbeddingMetadataModified: Emitted when metadata changes but content remains the same
  - EmbeddingDeleted: Emitted when an embedding is removed
* Ways to access:
  - EmbeddingRepository: Primary repository interface for persistence operations
  - SimilaritySearchService: Service for performing semantic searches using embeddings
  - EmbeddingBatchProcessor: Service for bulk creation and updates of embeddings
  - MetadataFilteringService: Service for advanced filtering and faceted search over embedding metadata
  - EmbeddingAdminService: Service for managing and monitoring the embedding collection
```

Important observations: Keep in mind that the folders domain, application and infrastructure are already created within the Shared context inside Embedding Module. Use them. 