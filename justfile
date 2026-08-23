# List available recipes for just
list:
    @just --list

# Install frontend dependencies
install:
    pnpm --dir frontend install

# Uninstall frontend dependencies
uninstall *args:
    pnpm --dir frontend uninstall {{args}}

# Add frontend dependencies
add *args:
    pnpm --dir frontend add {{args}}

# Update frontend dependencies
update *args:
    pnpm --dir frontend update {{args}}

# Start the development server
dev *args:
    pnpm --dir frontend dev {{args}}

# Start the development server bound to 0.0.0.0
dev-host *args:
    pnpm --dir frontend dev:host {{args}}

# Build for production
build:
    pnpm --dir frontend build

# Preview the production build
preview:
    pnpm --dir frontend preview

# Generate TanStack Router route tree
generate-routes:
    pnpm --dir frontend generate-routes

# Run unit tests
test *args:
    pnpm --dir frontend test {{args}}

# Run E2E tests
test-e2e *args:
    pnpm --dir frontend test:e2e {{args}}

# Run E2E tests with UI
test-e2e-ui *args:
    pnpm --dir frontend test:e2e:ui {{args}}

# Run linter
lint:
    pnpm --dir frontend lint

# Run markup linter
lint-markup:
    pnpm --dir frontend lint:markup

# Format code
format:
    pnpm --dir frontend format

# Run TypeScript type check
typecheck:
    pnpm --dir frontend typecheck

# Deploy to Cloudflare Workers
deploy:
    pnpm --dir frontend deploy

