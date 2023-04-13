package main

import (
	"embed"

	"github.com/HuolalaTech/page-spy-api/serve"
)

//go:embed dist/*
var publicContent embed.FS

func main() {
	serve.Run(&serve.StaticConfig{
		DirName: "dist",
		Files:   publicContent,
	})
}
