'''
* Name: The name of the aggregate.
* Description: A brief description of the aggregate.
* Context: The context where the aggregate belongs.
* Properties: A list of properties that the aggregate has. Optionally, you can specify the type of each property.
* Enforced Invariants: A list of invariants that the aggregate enforces.
* Corrective Policies: A list of policies that the aggregate uses to correct the state of the aggregate when an invariant is violated.
* Domain Events: A list of events that the aggregate emits.
* Ways to access: A list of ways to access the aggregate.
* Technical Integration Notes: Specific details about how this aggregate integrates with external systems.
* Metadata Best Practices: Guidelines for structuring and using metadata effectively.
* Batch Processing Support: How the aggregate handles batch operations.
'''

# Instructions to transform the Embedding Aggregate Design Blueprint to code:

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
        * For the Embedding repository, include specialized methods for semantic search.
* Inside the `application` folder, you'll have to create:
    * A folder using $FOLDERS_CASE for every mutation that the aggregate has (inferred by the domain events) and for every query that the aggregate has.
    * Inside every query/mutation folder, you'll have to create an `$USE_CASE.$FILES_FORMAT file that contains the query/mutation use case.
        * The file name should be the name of the query/mutation in PascalCase in a service mode. For example:
            * For a `search` query for the `Embedding` aggregate, the class should be `EmbeddingSearcher.$FILES_FORMAT.
            * For a `create` mutation for the `Embedding` aggregate, the class should be `EmbeddingCreator.$FILES_FORMAT.
        * You should take a look to other queries/mutations to see the format.
    * For mutations, create corresponding Command and CommandHandler files following the project's CQRS pattern:
        * For example, for `create` use case, create `CreateEmbeddingCommand.ts` and `CreateEmbeddingCommandHandler.ts`
        * The CommandHandler should use the use case service and then persist domain events using `CreateEventCommand`
* Inside the `infrastructure` folder, you'll have to create:
    * A `$REPOSITORY.$FILES_FORMAT file that contains the repository implementation:
        * The file name should be the name of the aggregate in PascalCase with the suffix `Repository`.
        * For Embeddings, use `PGVectorEmbeddingRepository.$FILES_FORMAT` to clearly indicate the use of PGVectorStore.
        * The repository should implement the repository interface from the domain layer.
        * Implementation should include the three patterns described in embeddins.md document.

# Event Handling Approach:

In this project, domain events are not published directly via an EventBus. Instead:

1. **Event Storage Pattern**: When aggregate operations emit domain events, these events should be stored using the `CreateEventCommand`:
```typescript
// Example in a CommandHandler
const embedding = Embedding.create(/* ... */);
await this.repository.save(embedding);

// Get domain events from the aggregate
const events = embedding.pullDomainEvents();

// Store each event using CreateEventCommand
await Promise.all(
  events.map(async (event) => {
    await this.commandBus.execute(
      new CreateEventCommand(
        event.eventName,
        event.toPrimitives(),
        event.aggregateId
      )
    );
  })
);
```

2. **Event Processing**: Events are later consumed and processed by dedicated handlers registered via `ConsumeEventCommand`

3. **Event Handlers Registration**: Use `EventAutoRegister` mechanism to register event handlers for specific event types

# PGVectorStore-specific Implementation Notes:

When implementing the Embedding repository with PGVectorStore, consider:

1. **Document Translation**: The repository must translate between domain Embedding objects and LangChain Document objects:
```typescript
// Example translation from domain to Document
const document = new Document({
    pageContent: embedding.content,
    metadata: embedding.metadata
});
```

2. **Vector Storage Patterns**: Implement all three patterns described in embeddins.md:
   - High-level approach (addDocuments) for simple operations
   - Intermediate approach (addVectors) for more control
   - Manual approach with direct SQL for performance-critical operations

3. **Metadata Handling**: Properly serialize/deserialize metadata as JSON for storage and retrieval.

4. **Connection Management**: Handle connection pooling and cleanup appropriately.

# Testing Approach for Embeddings:

Testing the Embedding aggregate requires special consideration due to its integration with PGVectorStore:

1. **Unit Tests**:
   - Mock OllamaEmbeddings to avoid actual embedding generation
   - Focus on testing domain logic: content validation, metadata validation, etc.
   - Test the translation between domain objects and Document objects
   - Mock CommandBus for event publishing tests

2. **Integration Tests**:
   - Use a test database with pgvector extension
   - Test actual storage and retrieval of embeddings
   - Consider using simplified test vectors rather than real embeddings
   - Verify event persistence using `CreateEventCommand`

3. **Test Organization**:
   - Group tests by functionality: content preparation, storage, retrieval, search

4. **Avoid Unnecessary Complexity**:
   - Don't test LangChain's internal functionality
   - Focus on your integration with LangChain and pgvector

# User variables:

$FOLDERS_CASE = kebab-case
$FILES_FORMAT = ts

# Aggregate Design Blueprint:

IMPORTANT: Review all markdown (.md) documents in the project root, especially embeddins.md which contains detailed information about embeddings and PGVectorStore implementation patterns.

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
* Technical Integration Notes:
  - This aggregate doesn't store the vector representation itself, as PGVectorStore handles vector generation and storage
  - The Repository implementation should use LangChain's Document structure as an intermediate layer
  - Use addVectors with explicit IDs rather than addDocuments for better control over the process
  - Domain events are stored using CreateEventCommand instead of direct EventBus publishing
  - Consider the three implementation patterns discussed in embeddins.md:
    * High-level approach for simple scripts
    * Intermediate approach for event listeners
    * Manual approach for performance-critical operations
* Metadata Best Practices:
  - Define common metadata fields as constants (e.g., SOURCE_URL, CREATION_DATE, AUTHOR)
  - Implement metadata validation to ensure filtering will work properly
  - Consider adding metadata indexes for frequently filtered fields
  - Provide helper methods for common metadata operations (addTag, setCategory, etc.)
* Batch Processing Support:
  - Implement batch creation methods to leverage PGVectorStore's batch operations
  - Add transaction support for batch operations
  - Consider pagination for large batch operations
  - Implement retry mechanisms for failed batch items
'''

Important observations: 
1. The folders domain, application and infrastructure are already created within the Shared context inside Embedding Module. Use them.
2. The implementation must align with existing vector search implementations in the codebase.
3. Pay special attention to the PGVectorStore initialization and embedding generation, following patterns in existing code.
4. The Embedding aggregate doesn't store the vector itself, only the content that will be vectorized.
5. Repository implementations should handle the translation between domain objects and LangChain's Document objects.
6. Follow the project's event pattern by using CreateEventCommand to persist domain events instead of publishing directly with EventBus. 