# Testing checklist – regex toolkit

1. Start the Toolbox control plane and Celery worker locally.
2. Install the toolkit using the dynamic bundle endpoint:
   ```bash
   curl -o /tmp/regex.zip http://localhost:8002/toolkits/regex/bundle.zip
   ```
3. Upload `/tmp/regex.zip` through the Toolbox admin UI.
4. Exercise the `/toolkits/regex/evaluate` API with the sample payload in
   `backend/models.py` to confirm a `200 OK` response.
5. Trigger the Celery task `regex.evaluate_async` and verify streaming progress
   events arrive in the control plane.
6. Load the React UI and confirm the live preview updates while typing.
7. Capture command output and screenshots, then attach the evidence to the PR.
