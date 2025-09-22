from __future__ import annotations

import io
import tempfile
import zipfile
import unittest
from pathlib import Path

import os

from scripts.build_toolkit_bundle import build_bundle_bytes, bundle_toolkit
from toolkit_bundle_service import application


class BuildBundleBytesTests(unittest.TestCase):
    def test_bundle_includes_manifest(self) -> None:
        data = build_bundle_bytes("sample-toolkit")
        self.assertGreater(len(data), 0)

        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            names = archive.namelist()
        self.assertIn("sample-toolkit/toolkit.json", names)

    def test_bundle_toolkit_writes_file(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            target = Path(tmp_dir) / "bundle.zip"
            bundle_toolkit("sample-toolkit", target, quiet=True)
            self.assertTrue(target.exists())
            self.assertGreater(target.stat().st_size, 0)


class BundleServiceTests(unittest.TestCase):
    def _invoke(self, path: str, method: str = "GET"):
        captured: dict[str, object] = {}

        def start_response(status: str, headers: list[tuple[str, str]]) -> None:
            captured["status"] = status
            captured["headers"] = dict(headers)

        environ = {"PATH_INFO": path, "REQUEST_METHOD": method}
        body = b"".join(application(environ, start_response))
        status_line = captured.get("status", "500 Internal Server Error")
        headers = captured.get("headers", {})
        return status_line, headers, body

    def test_catalog_manifest_served_from_disk(self) -> None:
        status, headers, body = self._invoke("/catalog/toolkits.json")
        self.assertTrue(status.startswith("200"))
        self.assertEqual(headers.get("Content-Type"), "application/json; charset=utf-8")

        repo_root = Path(__file__).resolve().parents[2]
        manifest_bytes = (repo_root / "catalog" / "toolkits.json").read_bytes()
        self.assertEqual(body, manifest_bytes)

    def test_catalog_manifest_head_request(self) -> None:
        status, headers, body = self._invoke("/catalog/toolkits.json", method="HEAD")
        self.assertTrue(status.startswith("200"))
        self.assertEqual(body, b"")
        self.assertEqual(headers.get("Content-Type"), "application/json; charset=utf-8")

    def test_download_returns_zip_archive(self) -> None:
        status, headers, body = self._invoke("/toolkits/sample-toolkit/bundle.zip")
        self.assertTrue(status.startswith("200"))
        self.assertEqual(headers.get("Content-Type"), "application/zip")
        self.assertIn(
            "attachment; filename=\"sample-toolkit_toolkit.zip\"",
            headers.get("Content-Disposition", ""),
        )

        with zipfile.ZipFile(io.BytesIO(body)) as archive:
            self.assertIn("sample-toolkit/toolkit.json", archive.namelist())

    def test_head_request_returns_metadata_only(self) -> None:
        status, headers, body = self._invoke("/toolkits/sample-toolkit/bundle.zip", method="HEAD")
        self.assertTrue(status.startswith("200"))
        self.assertEqual(body, b"")
        self.assertEqual(headers.get("Content-Type"), "application/zip")

    def test_download_missing_toolkit(self) -> None:
        status, headers, body = self._invoke("/toolkits/does-not-exist/bundle.zip")
        self.assertTrue(status.startswith("404"))
        self.assertEqual(headers.get("Content-Type"), "text/plain; charset=utf-8")
        self.assertEqual(body, b"Toolkit not found")

    def test_bundle_size_limit(self) -> None:
        original = os.environ.get("TOOLKIT_UPLOAD_MAX_BYTES")
        os.environ["TOOLKIT_UPLOAD_MAX_BYTES"] = "1"
        try:
            status, headers, body = self._invoke("/toolkits/sample-toolkit/bundle.zip")
        finally:
            if original is None:
                os.environ.pop("TOOLKIT_UPLOAD_MAX_BYTES", None)
            else:
                os.environ["TOOLKIT_UPLOAD_MAX_BYTES"] = original

        self.assertTrue(status.startswith("413"))
        self.assertEqual(headers.get("Content-Type"), "text/plain; charset=utf-8")
        self.assertEqual(body, b"Bundle exceeds configured limit")


if __name__ == "__main__":
    unittest.main()
