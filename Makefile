include n.Makefile

# Environment variables
# ---------------------

EXPECTED_COVERAGE = 80

# Verify tasks
# ------------

verify-coverage:
	@istanbul check-coverage --statement $(EXPECTED_COVERAGE) --branch $(EXPECTED_COVERAGE) --function $(EXPECTED_COVERAGE)
	@$(DONE)

# Test tasks
# ----------

test: test-unit-coverage verify-coverage test-integration
	@$(DONE)

test-unit:
	@NODE_ENV=test mocha test/unit --recursive
	@$(DONE)

test-unit-coverage:
	@NODE_ENV=test istanbul cover node_modules/.bin/_mocha -- test/unit --recursive
	@$(DONE)

test-integration:
	@NODE_ENV=test mocha test/integration --recursive
	@$(DONE)

# Deploy tasks
# ------------

deploy:
	@git push https://git.heroku.com/origami-imageset-uploader.git
	@make change-request-qa
	@$(DONE)

deploy-ci:
	@git push git@heroku.com:origami-imageset-uploader.git
	@make change-request-qa
	@$(DONE)

# Run tasks
# ---------

run:
	@npm start

run-dev:
	@nodemon --ext html,js,json index.js


# Run tasks
# ---------

run:
	@node index.js
