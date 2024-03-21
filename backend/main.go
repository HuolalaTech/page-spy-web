package main

import (
	"embed"
	"log"

	"github.com/HuolalaTech/page-spy-api/config"
	"github.com/HuolalaTech/page-spy-api/container"
	"github.com/HuolalaTech/page-spy-api/serve"
)

//go:embed dist/*
var publicContent embed.FS

var (
	Version string
	GitHash string
)

func main() {
	container := container.Container()
	err := container.Provide(func() *config.StaticConfig {
		return &config.StaticConfig{
			DirName: "dist",
			Files:   publicContent,
			Version: Version,
			GitHash: GitHash,
		}
	})

	if err != nil {
		log.Fatal(err)
	}

	serve.Run()
}
