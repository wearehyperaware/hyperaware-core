Description

  The visualization demo needs to be restored to working condition, specifically the Mapbox visualization showing vehicles traveling through zones with account debiting. The current implementation has tight coupling with Web3 services (IoTeX,  Arweave, Ethereum) which adds complexity to getting a demo running.

  # Goal

  Create a working demonstration primarily focused on the visualization aspect that can be used for teaching/demo purposes.

  # Current Challenges

  - Multiple blockchain dependencies (IoTeX, Ethereum, Arweave)
  - Secure enclave dependencies for privacy calculations
  - Complex API interactions for vehicle and zone data

  # Requested Changes

  Restore the dashboard visualization with minimal dependencies, focusing on:
  1. Vehicle movement across map
  2. Zone visualization
  3. Zone entry/exit detection
  4. Account debiting visualization

  # Suggested Approach

  One possible solution would be to:
  - Replace blockchain interactions with mock services
  - Use local JSON files instead of blockchain storage
  - Simulate transactions and debiting locally
  - Keep the Mapbox + D3 visualization components intact

  # Acceptance Criteria

  - Mapbox map displays correctly
  - Zones are properly rendered
  - Vehicles move along routes through zones
  - Zone entry/exit events are detected and displayed
  - Account debiting is simulated and shown in the UI
  - Demo can be started with minimal setup

  # Additional Notes

  The primary value is in the visualization and demonstration of the concept, not the blockchain integration. Please choose
  whatever implementation approach will get a working demo up and running with minimal complexity.